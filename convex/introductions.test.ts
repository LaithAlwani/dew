import { convexTest, type TestConvex } from "convex-test";
import { beforeEach, describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

const PRO_SUBJECT = "pro-subject";
const T0 = Date.UTC(2025, 5, 2, 13, 0); // Mon 09:00 EDT, inside the working window

// Typed with our schema so ctx.db in helpers knows the custom indexes.
type TestApi = TestConvex<typeof schema>;

// Seed a client, an approved professional (given capacity + credits), and a
// consultation + match ready to broadcast.
async function seed(t: TestApi, { capacity = 5, credits = 3 } = {}) {
  return await t.run(async (ctx) => {
    const clientId = await ctx.db.insert("users", {
      authUserId: "client-subject",
      role: "client",
      createdAt: 0,
    });
    const proUserId = await ctx.db.insert("users", {
      authUserId: PRO_SUBJECT,
      role: "professional",
      createdAt: 0,
    });
    const professionalId = await ctx.db.insert("professionals", {
      userId: proUserId,
      displayName: "Ada Pro",
      services: ["bridal_makeup"],
      capacity,
      approvalState: "approved",
      businessHours: { timezone: "America/Toronto", startMinute: 480, endMinute: 1260 },
      createdAt: 0,
    });
    if (credits > 0) {
      await ctx.db.insert("creditLedger", {
        professionalId,
        delta: credits,
        reason: "free_grant",
        balanceAfter: credits,
        createdAt: 0,
      });
    }
    const consultationId = await ctx.db.insert("consultations", {
      clientId,
      version: 1,
      safetyFlags: [],
      categoryAnswers: {},
      facePhotoStorageIds: [],
      createdAt: 0,
    });
    const matchId = await ctx.db.insert("matches", {
      consultationId,
      rankedProfessionalIds: [professionalId],
      createdAt: 0,
    });
    return { clientId, proUserId, professionalId, consultationId, matchId };
  });
}

async function preview(
  t: TestApi,
  ids: {
    matchId: Id<"matches">;
    consultationId: Id<"consultations">;
    professionalId: Id<"professionals">;
  },
) {
  return await t.mutation(internal.introductions.createIntroductionForPreview, {
    matchId: ids.matchId,
    consultationId: ids.consultationId,
    professionalId: ids.professionalId,
    now: T0,
  });
}

function status(t: TestApi, introductionId: Id<"introductions">) {
  return t.run(async (ctx) => (await ctx.db.get(introductionId))?.status);
}

function deadlineStates(t: TestApi, introductionId: Id<"introductions">) {
  return t.run(async (ctx) => {
    const rows = await ctx.db
      .query("deadlines")
      .withIndex("by_introductionId", (q) => q.eq("introductionId", introductionId))
      .collect();
    const out: Record<string, string> = {};
    for (const r of rows) {
      out[r.kind] = r.state;
    }
    return out;
  });
}

function balance(t: TestApi, professionalId: Id<"professionals">) {
  return t.run(async (ctx) => {
    const latest = await ctx.db
      .query("creditLedger")
      .withIndex("by_professionalId", (q) => q.eq("professionalId", professionalId))
      .order("desc")
      .first();
    return latest?.balanceAfter ?? 0;
  });
}

let t: TestApi;
beforeEach(() => {
  t = convexTest(schema, modules);
});

describe("preview creation", () => {
  test("opens preview reminder + expiry", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    expect(await status(t, introId)).toBe("previewed");
    expect(await deadlineStates(t, introId)).toEqual({
      preview_reminder: "pending",
      preview_expiry: "pending",
    });
  });
});

describe("happy path", () => {
  test("unlock → make_contact → client_reply → mark_connected", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });

    // Unlock: spends a credit, opens contact timers, cancels preview timers.
    const res = await asPro.mutation(api.introductions.unlock, { introductionId: introId });
    expect(res.balanceAfter).toBe(2);
    expect(await status(t, introId)).toBe("contact_pending");
    expect(await deadlineStates(t, introId)).toEqual({
      preview_reminder: "cancelled",
      preview_expiry: "cancelled",
      contact_reminder: "pending",
      contact_deadline: "pending",
      lifecycle_cap: "pending",
    });
    const conversation = await t.run((ctx) =>
      ctx.db
        .query("conversations")
        .withIndex("by_introductionId", (q) => q.eq("introductionId", introId))
        .unique(),
    );
    expect(conversation).not.toBeNull();

    // First professional message.
    await t.mutation(internal.introductions.transitionIntroduction, {
      introductionId: introId,
      event: "make_contact",
      now: T0,
    });
    expect(await status(t, introId)).toBe("contact_made");
    expect(await deadlineStates(t, introId)).toMatchObject({
      contact_reminder: "cancelled",
      contact_deadline: "cancelled",
      client_reminder: "pending",
      client_ghost: "pending",
      lifecycle_cap: "pending",
    });

    // Client replies — genuine exchange; ghost timers cleared, status stays.
    await t.mutation(internal.introductions.transitionIntroduction, {
      introductionId: introId,
      event: "client_reply",
      now: T0,
    });
    expect(await status(t, introId)).toBe("contact_made");
    expect(await deadlineStates(t, introId)).toMatchObject({
      client_reminder: "cancelled",
      client_ghost: "cancelled",
    });

    // Professional marks connected outside Dew — closes as delivered.
    await t.mutation(internal.introductions.transitionIntroduction, {
      introductionId: introId,
      event: "mark_connected",
      now: T0,
    });
    expect(await status(t, introId)).toBe("connected_off_platform");
    const closed = await t.run((ctx) =>
      ctx.db
        .query("conversations")
        .withIndex("by_introductionId", (q) => q.eq("introductionId", introId))
        .unique(),
    );
    expect(closed?.closureReason).toBe("connected_off_platform");
  });
});

describe("credits & capacity", () => {
  test("decline after unlocking still costs the credit", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });
    await asPro.mutation(api.introductions.unlock, { introductionId: introId });
    expect(await balance(t, ids.professionalId)).toBe(2);

    await t.mutation(internal.introductions.transitionIntroduction, {
      introductionId: introId,
      event: "decline",
      now: T0,
      declineReason: "scheduling_conflict",
    });
    expect(await status(t, introId)).toBe("declined");
    // Credit was NOT refunded by the decline.
    expect(await balance(t, ids.professionalId)).toBe(2);
  });

  test("cannot unlock without credits", async () => {
    const ids = await seed(t, { credits: 0 });
    const introId = await preview(t, ids);
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });
    await expect(
      asPro.mutation(api.introductions.unlock, { introductionId: introId }),
    ).rejects.toThrow(/No credits/);
  });

  test("cannot unlock beyond capacity", async () => {
    const ids = await seed(t, { capacity: 1 });
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });

    const first = await preview(t, ids);
    await asPro.mutation(api.introductions.unlock, { introductionId: first }); // active = 1

    // A second consultation/match for the same professional.
    const second = await t.run(async (ctx) => {
      const consultationId = await ctx.db.insert("consultations", {
        clientId: ids.clientId,
        version: 1,
        safetyFlags: [],
        categoryAnswers: {},
        facePhotoStorageIds: [],
        createdAt: 0,
      });
      const matchId = await ctx.db.insert("matches", {
        consultationId,
        rankedProfessionalIds: [ids.professionalId],
        createdAt: 0,
      });
      return { consultationId, matchId, professionalId: ids.professionalId };
    });
    const secondIntro = await preview(t, second);
    await expect(
      asPro.mutation(api.introductions.unlock, { introductionId: secondIntro }),
    ).rejects.toThrow(/capacity/);
  });
});

describe("illegal transitions", () => {
  test("make_contact from previewed is rejected", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    await expect(
      t.mutation(internal.introductions.transitionIntroduction, {
        introductionId: introId,
        event: "make_contact",
        now: T0,
      }),
    ).rejects.toThrow(/Illegal introduction transition/);
  });
});

describe("deadline sweep", () => {
  test("preview_expiry expires an un-unlocked introduction", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    const dueAt = await t.run(async (ctx) => {
      const d = await ctx.db
        .query("deadlines")
        .withIndex("by_introductionId", (q) => q.eq("introductionId", introId))
        .collect();
      return d.find((x) => x.kind === "preview_expiry")?.dueAt as number;
    });

    await t.mutation(internal.deadlines.sweepDeadlines, { now: dueAt });
    expect(await status(t, introId)).toBe("expired_no_unlock");
  });

  test("contact_deadline records no_contact and closes the conversation", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });
    await asPro.mutation(api.introductions.unlock, { introductionId: introId });

    const dueAt = await t.run(async (ctx) => {
      const d = await ctx.db
        .query("deadlines")
        .withIndex("by_introductionId", (q) => q.eq("introductionId", introId))
        .collect();
      return d.find((x) => x.kind === "contact_deadline")?.dueAt as number;
    });
    await t.mutation(internal.deadlines.sweepDeadlines, { now: dueAt });

    expect(await status(t, introId)).toBe("expired_no_contact");
    const events = await t.run((ctx) =>
      ctx.db
        .query("reliabilityEvents")
        .withIndex("by_professionalId", (q) => q.eq("professionalId", ids.professionalId))
        .collect(),
    );
    expect(events.map((e) => e.type)).toContain("no_contact");
  });

  test("client_ghost marks the client unresponsive", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });
    await asPro.mutation(api.introductions.unlock, { introductionId: introId });
    await t.mutation(internal.introductions.transitionIntroduction, {
      introductionId: introId,
      event: "make_contact",
      now: T0,
    });

    const dueAt = await t.run(async (ctx) => {
      const d = await ctx.db
        .query("deadlines")
        .withIndex("by_introductionId", (q) => q.eq("introductionId", introId))
        .collect();
      return d.find((x) => x.kind === "client_ghost")?.dueAt as number;
    });
    await t.mutation(internal.deadlines.sweepDeadlines, { now: dueAt });
    expect(await status(t, introId)).toBe("client_unresponsive");
  });

  test("a stale deadline is fired without disturbing an advanced introduction", async () => {
    const ids = await seed(t);
    const introId = await preview(t, ids);
    const asPro = t.withIdentity({ subject: PRO_SUBJECT });
    // Unlock cancels the preview_expiry; sweeping it now should be a no-op on status.
    await asPro.mutation(api.introductions.unlock, { introductionId: introId });
    await t.mutation(internal.deadlines.sweepDeadlines, { now: T0 + 1000 * 60 * 60 * 24 * 40 });
    expect(await status(t, introId)).toBe("contact_pending");
  });
});
