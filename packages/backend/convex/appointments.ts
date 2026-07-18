import { v, ConvexError } from "convex/values";
import {
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/** "$25" / "free intro" → cents. */
function parsePriceCents(label: string): number {
  const m = label.match(/(\d+(?:\.\d+)?)/);
  return m ? Math.round(parseFloat(m[1]!) * 100) : 0;
}

/** The signed-in user's id, or null (read-only — for queries). */
async function userIdByIdentity(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  return user?._id ?? null;
}

/** The signed-in user's id, provisioning a client row if missing (mutations). */
async function getOrCreateUserId(ctx: MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (user) return user._id;
  return await ctx.db.insert("users", {
    clerkUserId: identity.subject,
    name: identity.name,
    email: identity.email,
    expertStatus: "none",
    isAdmin: false,
    activeMode: "client",
    accountStatus: "active",
    subscriptionStatus: "free",
    onboardingComplete: false,
  });
}

/** Book a consult with an expert. */
export const book = mutation({
  args: {
    expertId: v.id("experts"),
    serviceName: v.string(),
    servicePrice: v.string(),
    scheduledAt: v.number(),
    durationMin: v.number(),
    note: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clientUserId = await getOrCreateUserId(ctx);
    const expert = await ctx.db.get("experts", args.expertId);
    if (!expert) throw new Error("Expert not found");

    // Authoritative price comes from the expert's own service, not the client.
    const service =
      expert.services.find((s) => s.name === args.serviceName) ?? expert.services[0];
    const servicePrice = service?.price ?? args.servicePrice;
    const amountCents = parsePriceCents(servicePrice);

    // Expert's contact email, if this is a real (linked) expert.
    let expertEmail: string | undefined;
    if (expert.userId) {
      const expertUser = await ctx.db.get("users", expert.userId);
      expertEmail = expertUser?.email;
    }

    // Prevent double-booking: reject if this expert already has a confirmed
    // consult overlapping the requested slot. (Atomic within this mutation.)
    const newStart = args.scheduledAt;
    const newEnd = newStart + args.durationMin * 60000;
    const nearby = await ctx.db
      .query("appointments")
      .withIndex("by_expert_and_time", (q) =>
        q
          .eq("expertId", args.expertId)
          .gte("scheduledAt", newStart - 6 * 3600000)
          .lte("scheduledAt", newEnd + 6 * 3600000),
      )
      .take(100);
    const clash = nearby.some(
      (b) =>
        b.status === "confirmed" &&
        b.scheduledAt < newEnd &&
        b.scheduledAt + b.durationMin * 60000 > newStart,
    );
    if (clash) {
      throw new ConvexError("That time was just booked — please choose another slot.");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      clientUserId,
      expertId: args.expertId,
      expertName: expert.name,
      serviceName: args.serviceName,
      servicePrice,
      scheduledAt: args.scheduledAt,
      durationMin: args.durationMin,
      note: args.note,
      status: "confirmed",
      // Payment — pretend Stripe succeeded (real charge wired later).
      amountCents,
      currency: "usd",
      paymentStatus: amountCents === 0 ? "free" : "paid",
      // Prefer the client-supplied identity (always present) over JWT claims.
      clientEmail: args.clientEmail ?? identity?.email,
      clientName: args.clientName ?? identity?.name,
      expertEmail,
    });

    // Send the confirmation + expert notification (best-effort, async).
    await ctx.scheduler.runAfter(0, internal.emails.sendBookingEmails, {
      appointmentId,
    });

    return appointmentId;
  },
});

/** Start times (epoch ms) already booked with an expert on a given day. */
export const takenSlots = query({
  args: { expertId: v.id("experts"), dayStart: v.number(), dayEnd: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("appointments")
      .withIndex("by_expert_and_time", (q) =>
        q
          .eq("expertId", args.expertId)
          .gte("scheduledAt", args.dayStart)
          .lte("scheduledAt", args.dayEnd),
      )
      .take(200);
    return rows.filter((a) => a.status === "confirmed").map((a) => a.scheduledAt);
  },
});

/** Internal: a single appointment (used by the email action). */
export const byId = internalQuery({
  args: { id: v.id("appointments") },
  handler: async (ctx, { id }) => ctx.db.get("appointments", id),
});

/** The client's confirmed, still-upcoming consults (soonest first). */
export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdByIdentity(ctx);
    if (!userId) return [];
    const now = Date.now();
    return await ctx.db
      .query("appointments")
      .withIndex("by_client_and_time", (q) =>
        q.eq("clientUserId", userId).gte("scheduledAt", now),
      )
      .order("asc")
      .take(20)
      .then((rows) => rows.filter((a) => a.status === "confirmed"));
  },
});

/** All the client's appointments, most recent first (for the appointments page). */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdByIdentity(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("appointments")
      .withIndex("by_client", (q) => q.eq("clientUserId", userId))
      .order("desc")
      .take(50);
  },
});

/** Cancel one of the client's own appointments. */
export const cancel = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, { id }) => {
    const userId = await userIdByIdentity(ctx);
    const appt = await ctx.db.get("appointments", id);
    if (!appt || appt.clientUserId !== userId) {
      throw new Error("Not found");
    }
    await ctx.db.patch("appointments", id, { status: "cancelled" });
    return null;
  },
});
