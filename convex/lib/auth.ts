import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Authorization guards. Called at the top of every non-public function.
// Identity comes from the Convex JWT subject (the Better Auth user id), which
// convex-test can set via t.withIdentity({ subject }).

type Role = Doc<"users">["role"];

export async function requireUser(ctx: QueryCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", identity.subject))
    .unique();
  if (!user) {
    throw new Error("No Dew user for this identity");
  }
  return user;
}

export async function requireRole(ctx: QueryCtx, role: Role): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== role) {
    throw new Error(`Forbidden: requires role ${role}`);
  }
  return user;
}

export function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  return requireRole(ctx, "admin");
}

// requireOwnsIntroduction lands in Phase 4 once the introductions table exists.
