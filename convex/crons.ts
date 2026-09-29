import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Deadlines are rows, not scheduled jobs — this sweep is the only ticker.
// Window lengths and quiet hours stay editable without rebooking anything.
crons.interval("sweep deadlines", { minutes: 5 }, internal.deadlines.sweepDeadlines, {});

export default crons;
