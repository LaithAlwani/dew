import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { applyTransition } from "./introductions";
import { DEADLINE_EVENT, isLegalTransition } from "./lib/fsm";

// Swept by the 5-minute cron. Fires every pending deadline that is due:
// expiry kinds drive an FSM transition; reminder kinds only notify (Phase 5).
// A failed transition leaves the deadline fired but the intro untouched; a
// stale deadline (its intro already moved on) is simply marked fired.
export const sweepDeadlines = internalMutation({
  args: { now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const due = await ctx.db
      .query("deadlines")
      .withIndex("by_state_dueAt", (q) => q.eq("state", "pending").lte("dueAt", now))
      .collect();

    let fired = 0;
    for (const deadline of due) {
      await ctx.db.patch(deadline._id, { state: "fired", firedAt: now });
      fired++;

      const event = DEADLINE_EVENT[deadline.kind];
      if (!event) {
        // Reminder kind — notify only. Wired to notify() in Phase 5.
        continue;
      }
      const intro = await ctx.db.get(deadline.introductionId);
      // Skip if the intro already advanced past this deadline's precondition.
      if (intro && isLegalTransition(event, intro.status)) {
        await applyTransition(ctx, deadline.introductionId, event, { now });
      }
    }
    return { swept: due.length, fired };
  },
});
