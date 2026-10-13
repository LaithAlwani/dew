import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// The client erasure path, designed from day one even though retention *timing*
// is still deferred to legal. Cascade-wipes every table carrying the client's
// PII; the credit ledger is anonymized (its client link cleared) rather than
// deleted, for financial integrity.
//
// Note: the client's name/email live in the Better Auth component's own tables
// and are deleted via the auth API as part of account deletion — a separate
// call layered on top of this when the account-deletion flow is built.
export const eraseClient = internalMutation({
  args: { clientId: v.id("users") },
  handler: async (ctx, { clientId }) => {
    const consultations = await ctx.db
      .query("consultations")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .collect();

    for (const consultation of consultations) {
      // Face photos out of file storage.
      for (const storageId of consultation.facePhotoStorageIds) {
        await ctx.storage.delete(storageId);
      }

      // Disclosure records for this consultation.
      const disclosures = await ctx.db
        .query("disclosureRecords")
        .withIndex("by_consultationId", (q) => q.eq("consultationId", consultation._id))
        .collect();
      for (const d of disclosures) {
        await ctx.db.delete(d._id);
      }

      // Matches (broadcast candidate sets).
      const matches = await ctx.db
        .query("matches")
        .withIndex("by_consultationId", (q) => q.eq("consultationId", consultation._id))
        .collect();
      for (const m of matches) {
        await ctx.db.delete(m._id);
      }

      // Introductions and everything hanging off them.
      const introductions = await ctx.db
        .query("introductions")
        .withIndex("by_consultationId", (q) => q.eq("consultationId", consultation._id))
        .collect();
      for (const intro of introductions) {
        // Anonymize the ledger: keep the financial row, drop the client link.
        if (intro.creditTxnId) {
          await ctx.db.patch(intro.creditTxnId, { introductionId: undefined });
        }

        const conversations = await ctx.db
          .query("conversations")
          .withIndex("by_introductionId", (q) => q.eq("introductionId", intro._id))
          .collect();
        for (const conversation of conversations) {
          const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
            .collect();
          for (const msg of messages) {
            await ctx.db.delete(msg._id);
          }
          await ctx.db.delete(conversation._id);
        }

        const deadlines = await ctx.db
          .query("deadlines")
          .withIndex("by_introductionId", (q) => q.eq("introductionId", intro._id))
          .collect();
        for (const dl of deadlines) {
          await ctx.db.delete(dl._id);
        }

        await ctx.db.delete(intro._id);
      }

      await ctx.db.delete(consultation._id);
    }

    // Anonymous discovery sessions.
    const sessions = await ctx.db
      .query("discoverySessions")
      .withIndex("by_userId", (q) => q.eq("userId", clientId))
      .collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }

    // Notifications addressed to the client.
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId", (q) => q.eq("recipientId", clientId))
      .collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }

    // Analytics: keep the aggregate, drop the personal linkage.
    const events = await ctx.db
      .query("events")
      .withIndex("by_actorId", (q) => q.eq("actorId", clientId))
      .collect();
    for (const e of events) {
      await ctx.db.patch(e._id, { actorId: undefined });
    }

    // The Dew user row: mark erased and drop the local PII field.
    const user = await ctx.db.get(clientId);
    if (user) {
      await ctx.db.patch(clientId, { erasedAt: Date.now(), timezone: undefined });
    }

    return { erasedConsultations: consultations.length };
  },
});
