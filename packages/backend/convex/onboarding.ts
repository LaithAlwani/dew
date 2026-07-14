import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Onboarding answer shape (Blueprint §4). Optional/multi fields match the
// questionnaire; only what onboarding needs now.
const onboardingArgs = {
  goals: v.array(v.string()),
  experienceLevel: v.optional(v.string()),
  struggles: v.array(v.string()),
  budget: v.optional(v.string()),
  guidancePreference: v.array(v.string()),
  skinType: v.optional(v.string()),
  skinConcerns: v.array(v.string()),
  makeupStyle: v.optional(v.string()),
  comfortLevel: v.optional(v.string()),
  allergies: v.optional(v.string()),
  consentAccepted: v.boolean(),
};

/** Persist onboarding answers for the signed-in client + mark onboarding done. */
export const save = mutation({
  args: onboardingArgs,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get-or-create: a client may reach onboarding before any layout provisions
    // their row, so create it here (onboarding is client-only) if it's missing.
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    const userId =
      existingUser?._id ??
      (await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        name: identity.name,
        email: identity.email,
        expertStatus: "none",
        isAdmin: false,
        activeMode: "client",
        accountStatus: "active",
        subscriptionStatus: "free",
        onboardingComplete: false,
      }));

    const existingProfile = await ctx.db
      .query("clientProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch("clientProfiles", existingProfile._id, args);
    } else {
      await ctx.db.insert("clientProfiles", { userId, ...args });
    }
    await ctx.db.patch("users", userId, { onboardingComplete: true });
    return null;
  },
});

/** The signed-in client's profile (onboarding answers), or null. */
export const myProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("clientProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});
