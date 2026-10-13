import { convexTest, type TestConvex } from "convex-test";
import { expect, test } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = (
  import.meta as unknown as {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("./**/*.ts");

type TestApi = TestConvex<typeof schema>;

test("eraseClient wipes PII across every table and anonymizes the ledger", async () => {
  const t: TestApi = convexTest(schema, modules);

  const seeded = await t.run(async (ctx) => {
    const clientId = await ctx.db.insert("users", {
      authUserId: "client",
      role: "client",
      timezone: "America/Toronto",
      createdAt: 0,
    });
    const proUserId = await ctx.db.insert("users", {
      authUserId: "pro",
      role: "professional",
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

    const photoId = await ctx.storage.store(new Blob(["face"]));
    const consultationId = await ctx.db.insert("consultations", {
      clientId,
      version: 1,
      safetyFlags: [],
      categoryAnswers: { occasion: "wedding" },
      notes: "sensitive free text",
      facePhotoStorageIds: [photoId],
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
    const introId = await ctx.db.insert("introductions", {
      matchId,
      consultationId,
      professionalId,
      status: "contact_made",
      unlockedAt: 0,
      creditTxnId,
      createdAt: 0,
    });
    // Link the ledger row to the introduction (as unlock would).
    await ctx.db.patch(creditTxnId, { introductionId: introId });
    const conversationId = await ctx.db.insert("conversations", {
      introductionId: introId,
      clientId,
      professionalId,
    });
    await ctx.db.insert("messages", {
      conversationId,
      senderId: clientId,
      body: "hello",
      moderationState: "visible",
      sentAt: 0,
    });
    await ctx.db.insert("deadlines", {
      kind: "lifecycle_cap",
      introductionId: introId,
      dueAt: 1,
      state: "pending",
      createdAt: 0,
    });
    await ctx.db.insert("disclosureRecords", {
      consultationId,
      version: 1,
      recipientProfessionalId: professionalId,
      disclosedAt: 0,
    });
    await ctx.db.insert("discoverySessions", { anonymousId: "a", userId: clientId, createdAt: 0 });
    await ctx.db.insert("notifications", {
      recipientId: clientId,
      templateKey: "x",
      channel: "email",
      uniqueKey: "k",
      deliveryState: "pending",
      createdAt: 0,
    });
    await ctx.db.insert("events", { name: "unlock", actorId: clientId, ts: 0 });

    return { clientId, professionalId, creditTxnId, photoId };
  });

  await t.mutation(internal.erasure.eraseClient, { clientId: seeded.clientId });

  const after = await t.run(async (ctx) => {
    const ledger = await ctx.db.get(seeded.creditTxnId);
    const events = await ctx.db.query("events").collect();
    const user = await ctx.db.get(seeded.clientId);
    return {
      consultations: (await ctx.db.query("consultations").collect()).length,
      matches: (await ctx.db.query("matches").collect()).length,
      introductions: (await ctx.db.query("introductions").collect()).length,
      conversations: (await ctx.db.query("conversations").collect()).length,
      messages: (await ctx.db.query("messages").collect()).length,
      deadlines: (await ctx.db.query("deadlines").collect()).length,
      disclosureRecords: (await ctx.db.query("disclosureRecords").collect()).length,
      discoverySessions: (await ctx.db.query("discoverySessions").collect()).length,
      notifications: (await ctx.db.query("notifications").collect()).length,
      ledgerStillExists: ledger !== null,
      ledgerIntroLinkCleared: ledger?.introductionId === undefined,
      eventActorCleared: events.every((e) => e.actorId === undefined),
      eventsKept: events.length,
      userErasedAt: user?.erasedAt !== undefined,
      userTimezoneCleared: user?.timezone === undefined,
      photo: await ctx.storage.get(seeded.photoId),
    };
  });

  // All client PII gone.
  expect(after.consultations).toBe(0);
  expect(after.matches).toBe(0);
  expect(after.introductions).toBe(0);
  expect(after.conversations).toBe(0);
  expect(after.messages).toBe(0);
  expect(after.deadlines).toBe(0);
  expect(after.disclosureRecords).toBe(0);
  expect(after.discoverySessions).toBe(0);
  expect(after.notifications).toBe(0);
  expect(after.photo).toBeNull();
  expect(after.userErasedAt).toBe(true);
  expect(after.userTimezoneCleared).toBe(true);
  // Ledger anonymized, not deleted.
  expect(after.ledgerStillExists).toBe(true);
  expect(after.ledgerIntroLinkCleared).toBe(true);
  // Analytics kept in aggregate, personal link removed.
  expect(after.eventsKept).toBe(1);
  expect(after.eventActorCleared).toBe(true);
});
