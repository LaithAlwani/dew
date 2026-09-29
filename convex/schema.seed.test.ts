import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";

// See users.test.ts — cast import.meta.glob locally for Convex's typecheck.
const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

// Proves the full 14-table model accepts a valid row in each table, with the
// foreign-key id references wired in dependency order.
test("seeds one row per table", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    const clientId = await ctx.db.insert("users", {
      authUserId: "client-auth",
      role: "client",
      createdAt: 0,
    });
    const proUserId = await ctx.db.insert("users", {
      authUserId: "pro-auth",
      role: "professional",
      createdAt: 0,
    });

    await ctx.db.insert("discoverySessions", {
      anonymousId: "anon",
      userId: clientId,
      createdAt: 0,
    });

    const professionalId = await ctx.db.insert("professionals", {
      userId: proUserId,
      displayName: "Ada Pro",
      services: ["bridal_makeup"],
      capacity: 5,
      approvalState: "approved",
      businessHours: { timezone: "America/Toronto", startMinute: 480, endMinute: 1260 },
      createdAt: 0,
    });

    const consultationId = await ctx.db.insert("consultations", {
      clientId,
      version: 1,
      safetyFlags: ["sensitive_skin"],
      categoryAnswers: { occasion: "wedding" },
      facePhotoStorageIds: [],
      createdAt: 0,
    });

    const matchId = await ctx.db.insert("matches", {
      consultationId,
      rankedProfessionalIds: [professionalId],
      createdAt: 0,
    });

    const creditTxnId = await ctx.db.insert("creditLedger", {
      professionalId,
      delta: -1,
      reason: "unlock_spend",
      balanceAfter: 4,
      createdAt: 0,
    });

    const introductionId = await ctx.db.insert("introductions", {
      matchId,
      consultationId,
      professionalId,
      status: "unlocked",
      unlockedAt: 0,
      creditTxnId,
      createdAt: 0,
    });

    const conversationId = await ctx.db.insert("conversations", {
      introductionId,
      clientId,
      professionalId,
    });

    await ctx.db.insert("messages", {
      conversationId,
      senderId: proUserId,
      body: "Hello!",
      moderationState: "visible",
      sentAt: 0,
    });

    await ctx.db.insert("deadlines", {
      kind: "contact_deadline",
      introductionId,
      dueAt: 1000,
      state: "pending",
      createdAt: 0,
    });

    await ctx.db.insert("notifications", {
      recipientId: proUserId,
      templateKey: "preview_ready",
      introductionId,
      channel: "email",
      uniqueKey: `${introductionId}:preview_ready:email`,
      deliveryState: "pending",
      createdAt: 0,
    });

    await ctx.db.insert("reliabilityEvents", {
      professionalId,
      type: "no_contact",
      introductionId,
      occurredAt: 0,
    });

    await ctx.db.insert("disclosureRecords", {
      consultationId,
      version: 1,
      recipientProfessionalId: professionalId,
      disclosedAt: 0,
    });

    await ctx.db.insert("events", {
      name: "unlock",
      actorId: proUserId,
      props: { introductionId },
      ts: 0,
    });

    await ctx.db.insert("moderationQueue", {
      targetType: "message",
      targetId: conversationId,
      reporterId: clientId,
      reason: "spam",
      state: "open",
      createdAt: 0,
    });
  });

  // Every table has exactly the rows we inserted.
  const counts = await t.run(async (ctx) => ({
    users: (await ctx.db.query("users").collect()).length,
    professionals: (await ctx.db.query("professionals").collect()).length,
    consultations: (await ctx.db.query("consultations").collect()).length,
    matches: (await ctx.db.query("matches").collect()).length,
    introductions: (await ctx.db.query("introductions").collect()).length,
    conversations: (await ctx.db.query("conversations").collect()).length,
    messages: (await ctx.db.query("messages").collect()).length,
    deadlines: (await ctx.db.query("deadlines").collect()).length,
    notifications: (await ctx.db.query("notifications").collect()).length,
    reliabilityEvents: (await ctx.db.query("reliabilityEvents").collect()).length,
    disclosureRecords: (await ctx.db.query("disclosureRecords").collect()).length,
    creditLedger: (await ctx.db.query("creditLedger").collect()).length,
    events: (await ctx.db.query("events").collect()).length,
    moderationQueue: (await ctx.db.query("moderationQueue").collect()).length,
  }));

  expect(counts).toEqual({
    users: 2,
    professionals: 1,
    consultations: 1,
    matches: 1,
    introductions: 1,
    conversations: 1,
    messages: 1,
    deadlines: 1,
    notifications: 1,
    reliabilityEvents: 1,
    disclosureRecords: 1,
    creditLedger: 1,
    events: 1,
    moderationQueue: 1,
  });
});
