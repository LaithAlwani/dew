import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";

// Returns the current Dew user row, or null if unauthenticated / not yet created.
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", identity.subject))
      .unique();
  },
});

// Creates the Dew user row for the authenticated identity if absent (default
// role: client). Idempotent. Step 4 wires this into the signup gate; the claim
// flow (step 2) promotes a row to `professional`.
export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", identity.subject))
      .unique();
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("users", {
      authUserId: identity.subject,
      role: "client",
      createdAt: Date.now(),
    });
  },
});

// The blueprint's non-negotiable: attach the anonymous discovery session to the
// account, losing nothing. One mutation. Reassigns every discovery session for
// the anonymousId to the current user, preserving all answers.
export const mergeAnonymousSession = mutation({
  args: { anonymousId: v.string() },
  handler: async (ctx, { anonymousId }) => {
    const user = await requireUser(ctx);
    const sessions = await ctx.db
      .query("discoverySessions")
      .withIndex("by_anonymousId", (q) => q.eq("anonymousId", anonymousId))
      .collect();
    for (const session of sessions) {
      // Preserve answers; only claim ownership. Idempotent per session.
      if (session.userId !== user._id) {
        await ctx.db.patch(session._id, { userId: user._id });
      }
    }
    return { merged: sessions.length };
  },
});
