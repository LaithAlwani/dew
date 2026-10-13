import { discoveryAnswersSchema } from "@dew/validation";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Client discovery is anonymous — no auth. A session is keyed by a
// client-generated anonymousId (persisted in localStorage) and later attached
// to an account losslessly via users.mergeAnonymousSession (step 4).

export const getSession = query({
  args: { anonymousId: v.string() },
  handler: async (ctx, { anonymousId }) =>
    await ctx.db
      .query("discoverySessions")
      .withIndex("by_anonymousId", (q) => q.eq("anonymousId", anonymousId))
      .unique(),
});

// Upsert + merge the discovery answers. Called after each step, so answers
// accumulate. Enum values are validated by the shared Zod schema.
export const saveAnswers = mutation({
  args: {
    anonymousId: v.string(),
    answers: v.object({
      category: v.optional(v.string()),
      occasion: v.optional(v.string()),
      timing: v.optional(v.string()),
      budget: v.optional(v.string()),
      city: v.optional(v.string()),
      safetyFlags: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { anonymousId, answers }) => {
    const parsed = discoveryAnswersSchema.parse(answers);
    const existing = await ctx.db
      .query("discoverySessions")
      .withIndex("by_anonymousId", (q) => q.eq("anonymousId", anonymousId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { answers: { ...(existing.answers ?? {}), ...parsed } });
      return existing._id;
    }
    return await ctx.db.insert("discoverySessions", {
      anonymousId,
      answers: parsed,
      createdAt: Date.now(),
    });
  },
});
