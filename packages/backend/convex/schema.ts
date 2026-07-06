import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("client"),
  v.literal("expert"),
  v.literal("admin"),
);

export const subscriptionValidator = v.union(
  v.literal("free"),
  v.literal("limited"),
  v.literal("premium"),
);

export const accountStatusValidator = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("deleted"),
);

export default defineSchema({
  // One row per Clerk user. `role` drives client / expert / admin routing.
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: roleValidator,
    accountStatus: accountStatusValidator,
    subscriptionStatus: subscriptionValidator,
    onboardingComplete: v.boolean(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  // Client onboarding answers (Blueprint §4/§30) — feeds matching + personalization.
  clientProfiles: defineTable({
    userId: v.id("users"),
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
  }).index("by_userId", ["userId"]),
});
