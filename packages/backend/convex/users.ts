import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { roleValidator } from "./schema";

/** Look up the signed-in user's row (or null). */
async function userByIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
}

/** The current user document, or null if signed out / not yet provisioned. */
export const current = query({
  args: {},
  handler: async (ctx) => userByIdentity(ctx),
});

/**
 * Idempotently create the user row on first authenticated visit.
 * Identity is derived server-side — never trust a client-supplied id (guidelines).
 */
export const ensureUser = mutation({
  args: { role: v.optional(roleValidator) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      name: identity.name,
      email: identity.email,
      role: args.role ?? "client",
      accountStatus: "active",
      subscriptionStatus: "free",
      onboardingComplete: false,
    });
  },
});
