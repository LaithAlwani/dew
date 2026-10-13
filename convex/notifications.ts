import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import { type NotificationChannel, sendViaChannel } from "./lib/channels";

// Resolve which channels a recipient wants. Email is the default primary
// channel; web push is opt-in (post-install, per the notification plan); native
// arrives later behind the same interface.
function channelsFor(prefs: Doc<"users">["notificationPrefs"]): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (prefs?.email !== false) {
    channels.push("email"); // default primary channel; off only if explicitly disabled
  }
  if (prefs?.webPush) {
    channels.push("web_push");
  }
  return channels;
}

interface NotifyArgs {
  recipientId: Id<"users">;
  templateKey: string;
  introductionId?: Id<"introductions">;
}

// The one notify layer. Writes a pending delivery record per resolved channel,
// deduped on a unique key so overlapping sweeps never double-send. Actual
// sending is done by deliverPending; a row stays pending until it succeeds.
export async function notify(ctx: MutationCtx, args: NotifyArgs): Promise<number> {
  const recipient = await ctx.db.get(args.recipientId);
  if (!recipient) {
    return 0;
  }
  const now = Date.now();
  let created = 0;
  for (const channel of channelsFor(recipient.notificationPrefs)) {
    const uniqueKey = `${args.introductionId ?? "none"}:${args.templateKey}:${channel}`;
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_uniqueKey", (q) => q.eq("uniqueKey", uniqueKey))
      .first();
    if (existing) {
      continue; // dedupe — OCC makes the read-then-insert safe across sweeps
    }
    await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      templateKey: args.templateKey,
      introductionId: args.introductionId,
      channel,
      uniqueKey,
      deliveryState: "pending",
      createdAt: now,
    });
    created++;
  }
  return created;
}

// External entry point (tests, later callers) for the notify helper.
export const enqueueNotification = internalMutation({
  args: {
    recipientId: v.id("users"),
    templateKey: v.string(),
    introductionId: v.optional(v.id("introductions")),
  },
  handler: async (ctx, args) => notify(ctx, args),
});

export const pendingNotifications = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) =>
    await ctx.db
      .query("notifications")
      .withIndex("by_deliveryState", (q) => q.eq("deliveryState", "pending"))
      .take(limit ?? 50),
});

export const markSent = internalMutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { deliveryState: "sent", sentAt: Date.now() });
  },
});

// Attempts delivery of every pending notification. Success → sent; any failure
// (including "not configured") leaves the row pending, so the next run retries.
export const deliverPending = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (
    ctx,
    { limit },
  ): Promise<{ attempted: number; sent: number; pending: number }> => {
    // Annotated to break the self-referential inference cycle (action → query
    // in the same module).
    const pending: Doc<"notifications">[] = await ctx.runQuery(
      internal.notifications.pendingNotifications,
      { limit },
    );
    let sent = 0;
    for (const n of pending) {
      // TODO(email): resolve the recipient's address via the Better Auth
      // component when email is switched on. Until then `to` is empty and the
      // email channel reports not_configured, keeping the row pending.
      const to = "";
      const result = await sendViaChannel(n.channel, to, n.templateKey, {});
      if (result.ok) {
        await ctx.runMutation(internal.notifications.markSent, { id: n._id });
        sent++;
      }
    }
    return { attempted: pending.length, sent, pending: pending.length - sent };
  },
});
