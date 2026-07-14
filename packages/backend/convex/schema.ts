import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Every account is a client. Being an expert is an add-on the user applies for
// and an admin approves — so a user can be BOTH (dual profile).
export const expertStatusValidator = v.union(
  v.literal("none"),
  v.literal("pending"),
  v.literal("approved"),
);

// Which view a dual (client+expert) user is currently in — remembered so their
// next visit lands where they left off.
export const activeModeValidator = v.union(
  v.literal("client"),
  v.literal("expert"),
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
  // One row per Clerk user. Everyone is a client; `expertStatus` + `isAdmin` add
  // capabilities on top, and `activeMode` remembers a dual user's current view.
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    expertStatus: expertStatusValidator,
    isAdmin: v.boolean(),
    activeMode: activeModeValidator,
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

  // Public expert listings that clients browse + book. `userId` links to a real
  // signed-up expert once approved; seeded showcase experts leave it unset.
  experts: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    title: v.string(),
    bio: v.string(),
    specialties: v.array(v.string()),
    rating: v.number(),
    reviewCount: v.number(),
    priceLabel: v.string(),
    reason: v.string(),
    services: v.array(
      v.object({ name: v.string(), meta: v.string(), price: v.string() }),
    ),
    published: v.boolean(),
    // Lowercased "name title specialties" — powers full-text search + chips.
    searchText: v.optional(v.string()),
  })
    .index("by_published", ["published"])
    .index("by_userId", ["userId"])
    .searchIndex("search_experts", {
      searchField: "searchText",
      filterFields: ["published"],
    }),
});
