import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx, mutation } from "./_generated/server";
import { requireRole } from "./lib/auth";
import { type BusinessHours, computeDueAt, DEADLINE_WINDOWS_MS } from "./lib/deadlines";
import { assertTransition, type IntroEvent } from "./lib/fsm";

const introEventValidator = v.union(
  v.literal("unlock"),
  v.literal("decline"),
  v.literal("make_contact"),
  v.literal("client_reply"),
  v.literal("mark_connected"),
  v.literal("expire_preview"),
  v.literal("expire_contact"),
  v.literal("ghost_client"),
  v.literal("cap_lifecycle"),
);

type DeadlineKind = keyof typeof DEADLINE_WINDOWS_MS;

async function cancelDeadlines(
  ctx: MutationCtx,
  introductionId: Id<"introductions">,
  kinds: DeadlineKind[],
): Promise<void> {
  if (kinds.length === 0) {
    return;
  }
  const pending = await ctx.db
    .query("deadlines")
    .withIndex("by_introductionId", (q) => q.eq("introductionId", introductionId))
    .collect();
  for (const d of pending) {
    if (d.state === "pending" && kinds.includes(d.kind)) {
      await ctx.db.patch(d._id, { state: "cancelled" });
    }
  }
}

async function createDeadlines(
  ctx: MutationCtx,
  introductionId: Id<"introductions">,
  kinds: DeadlineKind[],
  startMs: number,
  bh: BusinessHours,
): Promise<void> {
  for (const kind of kinds) {
    await ctx.db.insert("deadlines", {
      kind,
      introductionId,
      dueAt: computeDueAt(startMs, DEADLINE_WINDOWS_MS[kind], bh),
      state: "pending",
      createdAt: startMs,
    });
  }
}

async function getConversation(ctx: MutationCtx, introductionId: Id<"introductions">) {
  return await ctx.db
    .query("conversations")
    .withIndex("by_introductionId", (q) => q.eq("introductionId", introductionId))
    .unique();
}

interface TransitionOptions {
  now: number;
  creditTxnId?: Id<"creditLedger">;
  declineReason?: string;
}

// The single writer of introduction status and the only creator/canceller of
// deadlines. Every state change in the system flows through here.
export async function applyTransition(
  ctx: MutationCtx,
  introductionId: Id<"introductions">,
  event: IntroEvent,
  opts: TransitionOptions,
): Promise<void> {
  const intro = await ctx.db.get(introductionId);
  if (!intro) {
    throw new Error("Introduction not found");
  }
  const spec = assertTransition(event, intro.status);
  const professional = await ctx.db.get(intro.professionalId);
  if (!professional) {
    throw new Error("Professional not found");
  }
  const { now } = opts;

  // Deadlines: cancel then open, both only from here.
  await cancelDeadlines(ctx, introductionId, spec.cancelKinds);
  await createDeadlines(ctx, introductionId, spec.createKinds, now, professional.businessHours);

  // Status + audit fields.
  const patch: Partial<{
    status: typeof intro.status;
    unlockedAt: number;
    creditTxnId: Id<"creditLedger">;
    declineReason: string;
  }> = {};
  if (spec.to) {
    patch.status = spec.to;
  }
  if (event === "unlock") {
    patch.unlockedAt = now;
    if (opts.creditTxnId) {
      patch.creditTxnId = opts.creditTxnId;
    }
  }
  if (event === "decline" && opts.declineReason) {
    patch.declineReason = opts.declineReason;
  }
  if (Object.keys(patch).length > 0) {
    await ctx.db.patch(introductionId, patch);
  }

  // Conversation effects.
  if (event === "unlock") {
    const consultation = await ctx.db.get(intro.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }
    await ctx.db.insert("conversations", {
      introductionId,
      clientId: consultation.clientId,
      professionalId: intro.professionalId,
    });
  } else if (event === "make_contact") {
    const conversation = await getConversation(ctx, introductionId);
    if (conversation) {
      await ctx.db.patch(conversation._id, { firstProMessageAt: now });
    }
  } else if (event === "client_reply") {
    const conversation = await getConversation(ctx, introductionId);
    if (conversation) {
      await ctx.db.patch(conversation._id, { firstClientReplyAt: now });
    }
  }
  if (spec.closesConversation) {
    const conversation = await getConversation(ctx, introductionId);
    if (conversation && !conversation.closedAt) {
      await ctx.db.patch(conversation._id, {
        closedAt: now,
        closureReason: spec.closesConversation,
      });
    }
  }

  // Reliability signal (e.g. accepted-but-never-contacted).
  if (spec.reliabilityEvent) {
    await ctx.db.insert("reliabilityEvents", {
      professionalId: intro.professionalId,
      type: spec.reliabilityEvent,
      introductionId,
      occurredAt: now,
    });
  }
}

// Internal entry point for the FSM: used by the deadline sweep and by later
// steps (messaging, admin) to drive transitions. Sole-writer guarantee holds
// because it delegates to applyTransition.
export const transitionIntroduction = internalMutation({
  args: {
    introductionId: v.id("introductions"),
    event: introEventValidator,
    now: v.optional(v.number()),
    declineReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await applyTransition(ctx, args.introductionId, args.event, {
      now: args.now ?? Date.now(),
      declineReason: args.declineReason,
    });
  },
});

// Creates a previewed introduction and opens its preview reminder + expiry.
// Called by matching (step 5) when a consultation is broadcast to a candidate.
export const createIntroductionForPreview = internalMutation({
  args: {
    matchId: v.id("matches"),
    consultationId: v.id("consultations"),
    professionalId: v.id("professionals"),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const professional = await ctx.db.get(args.professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    const now = args.now ?? Date.now();
    const introductionId = await ctx.db.insert("introductions", {
      matchId: args.matchId,
      consultationId: args.consultationId,
      professionalId: args.professionalId,
      status: "previewed",
      createdAt: now,
    });
    await createDeadlines(
      ctx,
      introductionId,
      ["preview_reminder", "preview_expiry"],
      now,
      professional.businessHours,
    );
    return introductionId;
  },
});

// The professional's current credit balance (latest ledger row's balanceAfter).
async function currentBalance(
  ctx: MutationCtx,
  professionalId: Id<"professionals">,
): Promise<number> {
  const latest = await ctx.db
    .query("creditLedger")
    .withIndex("by_professionalId", (q) => q.eq("professionalId", professionalId))
    .order("desc")
    .first();
  return latest?.balanceAfter ?? 0;
}

// Count of introductions occupying capacity right now.
// ponytail: counts by status only; a lifecycle-capped (conversation-closed but
// still contact_made) intro is refined out in step 7.
async function activeIntroductionCount(
  ctx: MutationCtx,
  professionalId: Id<"professionals">,
): Promise<number> {
  const pending = await ctx.db
    .query("introductions")
    .withIndex("by_professional_status", (q) =>
      q.eq("professionalId", professionalId).eq("status", "contact_pending"),
    )
    .collect();
  const made = await ctx.db
    .query("introductions")
    .withIndex("by_professional_status", (q) =>
      q.eq("professionalId", professionalId).eq("status", "contact_made"),
    )
    .collect();
  return pending.length + made.length;
}

// Professional pays a credit to unlock a client (= accept). Atomic: the credit
// deduction and the state transition commit together. Under broadcast
// multi-unlock, several professionals may unlock the same consultation
// independently — each spends its own credit and gets its own conversation.
export const unlock = mutation({
  args: { introductionId: v.id("introductions") },
  handler: async (ctx, { introductionId }) => {
    const user = await requireRole(ctx, "professional");
    const professional = await ctx.db
      .query("professionals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!professional) {
      throw new Error("No professional profile for this user");
    }
    if (professional.approvalState !== "approved") {
      throw new Error("Professional is not approved to unlock introductions");
    }

    const intro = await ctx.db.get(introductionId);
    if (!intro) {
      throw new Error("Introduction not found");
    }
    if (intro.professionalId !== professional._id) {
      throw new Error("Forbidden: introduction belongs to another professional");
    }
    if (intro.status !== "previewed") {
      throw new Error(`Cannot unlock an introduction in status "${intro.status}"`);
    }

    if ((await activeIntroductionCount(ctx, professional._id)) >= professional.capacity) {
      throw new Error("At capacity: resolve an active introduction before unlocking another");
    }

    const balance = await currentBalance(ctx, professional._id);
    if (balance <= 0) {
      throw new Error("No credits available");
    }

    const now = Date.now();
    const creditTxnId = await ctx.db.insert("creditLedger", {
      professionalId: professional._id,
      delta: -1,
      reason: "unlock_spend",
      introductionId,
      balanceAfter: balance - 1,
      createdAt: now,
    });

    await applyTransition(ctx, introductionId, "unlock", { now, creditTxnId });
    return { creditTxnId, balanceAfter: balance - 1 };
  },
});
