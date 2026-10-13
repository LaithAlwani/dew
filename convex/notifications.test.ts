import { convexTest, type TestConvex } from "convex-test";
import { beforeEach, describe, expect, test } from "vitest";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

type TestApi = TestConvex<typeof schema>;

let t: TestApi;
beforeEach(() => {
  t = convexTest(schema, modules);
});

async function makeUser(t: TestApi): Promise<Id<"users">> {
  return await t.run((ctx) =>
    ctx.db.insert("users", { authUserId: "u", role: "client", createdAt: 0 }),
  );
}

describe("analytics emit", () => {
  test("writes an event row", async () => {
    const actorId = await makeUser(t);
    await t.mutation(internal.analytics.emitEvent, { name: "discovery_started", actorId });
    const events = await t.run((ctx) => ctx.db.query("events").collect());
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("discovery_started");
  });
});

describe("notify layer", () => {
  test("dedupes: two enqueues for the same key produce one row", async () => {
    const recipientId = await makeUser(t);
    await t.mutation(internal.notifications.enqueueNotification, {
      recipientId,
      templateKey: "preview_ready",
    });
    await t.mutation(internal.notifications.enqueueNotification, {
      recipientId,
      templateKey: "preview_ready",
    });
    const rows = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(rows).toHaveLength(1); // one email row, not two
    expect(rows[0].deliveryState).toBe("pending");
  });

  test("an unconfigured send stays pending for the next run", async () => {
    const recipientId = await makeUser(t);
    await t.mutation(internal.notifications.enqueueNotification, {
      recipientId,
      templateKey: "preview_ready",
    });
    // No RESEND_API_KEY in the test env → email reports not_configured.
    const result = await t.action(internal.notifications.deliverPending, {});
    expect(result.sent).toBe(0);
    expect(result.pending).toBe(1);
    const rows = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(rows[0].deliveryState).toBe("pending");
  });
});

describe("sweep → reminder notification", () => {
  test("a fired preview reminder notifies the professional", async () => {
    const ids = await t.run(async (ctx) => {
      const proUserId = await ctx.db.insert("users", {
        authUserId: "pro",
        role: "professional",
        createdAt: 0,
      });
      const clientId = await ctx.db.insert("users", {
        authUserId: "client",
        role: "client",
        createdAt: 0,
      });
      const professionalId = await ctx.db.insert("professionals", {
        userId: proUserId,
        displayName: "Ada",
        services: [],
        capacity: 5,
        approvalState: "approved",
        businessHours: { timezone: "America/Toronto", startMinute: 480, endMinute: 1260 },
        createdAt: 0,
      });
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
      return { proUserId, consultationId, matchId, professionalId };
    });

    const introId = await t.mutation(internal.introductions.createIntroductionForPreview, {
      matchId: ids.matchId,
      consultationId: ids.consultationId,
      professionalId: ids.professionalId,
      now: Date.UTC(2025, 5, 2, 13, 0),
    });

    const dueAt = await t.run(async (ctx) => {
      const ds = await ctx.db
        .query("deadlines")
        .withIndex("by_introductionId", (q) => q.eq("introductionId", introId))
        .collect();
      return ds.find((d) => d.kind === "preview_reminder")?.dueAt as number;
    });

    await t.mutation(internal.deadlines.sweepDeadlines, { now: dueAt });

    const notes = await t.run((ctx) =>
      ctx.db
        .query("notifications")
        .withIndex("by_recipientId", (q) => q.eq("recipientId", ids.proUserId))
        .collect(),
    );
    expect(notes).toHaveLength(1);
    expect(notes[0].templateKey).toBe("preview_reminder");
  });
});
