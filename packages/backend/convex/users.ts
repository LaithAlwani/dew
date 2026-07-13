import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { activeModeValidator } from "./schema";

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
 * `applyAsExpert` (from the sign-up "expert" choice) starts the expert application
 * as `pending`; everyone is a client regardless.
 */
export const ensureUser = mutation({
  args: { applyAsExpert: v.optional(v.boolean()) },
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
      expertStatus: args.applyAsExpert ? "pending" : "none",
      isAdmin: false,
      activeMode: "client",
      accountStatus: "active",
      subscriptionStatus: "free",
      onboardingComplete: false,
    });
  },
});

/** Remember which view a dual user last used, so their next visit lands there. */
export const setActiveMode = mutation({
  args: { mode: activeModeValidator },
  handler: async (ctx, args) => {
    const user = await userByIdentity(ctx);
    if (!user) throw new Error("Not authenticated");
    // Only approved experts can switch into the expert view.
    if (args.mode === "expert" && user.expertStatus !== "approved") {
      throw new Error("Not an approved expert");
    }
    await ctx.db.patch("users", user._id, { activeMode: args.mode });
    return null;
  },
});

/**
 * Complete expert identity verification and activate the expert profile.
 * PLACEHOLDER: real identity verification (Didit) + admin review will gate this
 * later — for now clicking "Start verification" approves the expert immediately.
 */
export const completeExpertVerification = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await userByIdentity(ctx);
    if (!user) throw new Error("Not authenticated");
    await ctx.db.patch("users", user._id, {
      expertStatus: "approved",
      activeMode: "expert",
    });
    return null;
  },
});
