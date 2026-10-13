import { professionalProfileSchema } from "@dew/validation";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireRole, requireUser } from "./lib/auth";

// Starting free credits granted on approval. A payment parameter — tune in the
// credits step (step 9); kept as a named constant so it's easy to find.
const FREE_CREDIT_GRANT = 3;

// The signed-in user's professional profile, or null.
export const getMyProfessional = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", identity.subject))
      .unique();
    if (!user) {
      return null;
    }
    return await ctx.db
      .query("professionals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Start a professional claim: flips the caller to the professional role and
// opens a pending_review profile. Invite-only in spirit — nobody goes live
// without admin approval. Idempotent.
export const claimProfessional = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("professionals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (existing) {
      return existing._id;
    }
    if (user.role !== "professional") {
      await ctx.db.patch(user._id, { role: "professional" });
    }
    return await ctx.db.insert("professionals", {
      userId: user._id,
      displayName: "",
      services: [],
      capacity: FREE_CREDIT_GRANT,
      approvalState: "pending_review",
      businessHours: { timezone: "America/Toronto", startMinute: 540, endMinute: 1020 },
      createdAt: Date.now(),
    });
  },
});

// Edit the caller's own profile. Rich validation via the shared Zod schema;
// editable while pending or approved.
export const updateProfile = mutation({
  args: {
    displayName: v.string(),
    bio: v.optional(v.string()),
    services: v.array(v.string()),
    businessHours: v.object({
      timezone: v.string(),
      startMinute: v.number(),
      endMinute: v.number(),
    }),
    bookingLink: v.optional(v.string()),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "professional");
    const pro = await ctx.db
      .query("professionals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!pro) {
      throw new Error("No professional profile to update");
    }
    const parsed = professionalProfileSchema.parse(args);
    await ctx.db.patch(pro._id, {
      displayName: parsed.displayName,
      bio: parsed.bio,
      services: parsed.services,
      businessHours: parsed.businessHours,
      bookingLink: parsed.bookingLink,
      capacity: parsed.capacity,
    });
  },
});

// Put a rejected profile back into the review queue. Owner-only; valid only
// from `rejected` (paused is admin-resolved, not self-service).
export const resubmitForReview = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, "professional");
    const pro = await ctx.db
      .query("professionals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!pro) {
      throw new Error("No professional profile to resubmit");
    }
    if (pro.approvalState !== "rejected") {
      throw new Error("Only a rejected profile can be resubmitted for review");
    }
    await ctx.db.patch(pro._id, { approvalState: "pending_review" });
  },
});

// --- Admin (admin. surface) ---

export const listPendingProfessionals = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("professionals")
      .withIndex("by_approvalState", (q) => q.eq("approvalState", "pending_review"))
      .collect();
  },
});

// Approve a professional and grant the starting free credits (once). This is
// what makes a professional eligible to receive previews and unlock clients.
export const approveProfessional = mutation({
  args: { professionalId: v.id("professionals") },
  handler: async (ctx, { professionalId }) => {
    await requireAdmin(ctx);
    const pro = await ctx.db.get(professionalId);
    if (!pro) {
      throw new Error("Professional not found");
    }
    if (pro.approvalState === "approved") {
      return; // idempotent — no double grant
    }
    await ctx.db.patch(professionalId, { approvalState: "approved" });
    const anyLedger = await ctx.db
      .query("creditLedger")
      .withIndex("by_professionalId", (q) => q.eq("professionalId", professionalId))
      .first();
    if (!anyLedger) {
      await ctx.db.insert("creditLedger", {
        professionalId,
        delta: FREE_CREDIT_GRANT,
        reason: "free_grant",
        balanceAfter: FREE_CREDIT_GRANT,
        createdAt: Date.now(),
      });
    }
  },
});

export const rejectProfessional = mutation({
  args: { professionalId: v.id("professionals") },
  handler: async (ctx, { professionalId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(professionalId, { approvalState: "rejected" });
  },
});
