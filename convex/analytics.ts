import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";

interface EmitArgs {
  name: string;
  actorId?: Id<"users">;
  props?: unknown;
}

// The funnel is the business: discovery → match → unlock → exchange → booking.
// Every meaningful step calls emit(); events are queried into funnels later.
export async function emit(ctx: MutationCtx, args: EmitArgs): Promise<void> {
  await ctx.db.insert("events", {
    name: args.name,
    actorId: args.actorId,
    props: args.props,
    ts: Date.now(),
  });
}

export const emitEvent = internalMutation({
  args: {
    name: v.string(),
    actorId: v.optional(v.id("users")),
    props: v.optional(v.any()),
  },
  handler: async (ctx, args) => emit(ctx, args),
});
