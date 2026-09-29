import { describe, expect, test } from "vitest";
import { type BusinessHours, computeDueAt, HOUR_MS } from "./lib/deadlines";

// Toronto working day 08:00–21:00; quiet hours 21:00–08:00.
const TORONTO: BusinessHours = {
  timezone: "America/Toronto",
  startMinute: 8 * 60,
  endMinute: 21 * 60,
};

// Format an instant as Toronto local wall-clock, independent of the utility's
// internals — so the assertions genuinely check DST handling.
function toTorontoWall(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(ms));
}

describe("computeDueAt — quiet hours", () => {
  test("stays within the working window when it fits", () => {
    // Mon 2025-06-02 09:00 EDT (13:00 UTC) + 4h active = 13:00 same day.
    const start = Date.UTC(2025, 5, 2, 13, 0);
    expect(toTorontoWall(computeDueAt(start, 4 * HOUR_MS, TORONTO))).toBe("2025-06-02, 13:00");
  });

  test("pauses overnight and resumes at the next open", () => {
    // 2025-06-02 19:00 EDT + 4h: 2h to 21:00, then 2h from next 08:00 = 10:00.
    const start = Date.UTC(2025, 5, 2, 23, 0);
    expect(toTorontoWall(computeDueAt(start, 4 * HOUR_MS, TORONTO))).toBe("2025-06-03, 10:00");
  });

  test("spans multiple days", () => {
    // 2025-06-02 09:00 EDT + 20h: 12h to 21:00, then 8h from 08:00 = 16:00 next day.
    const start = Date.UTC(2025, 5, 2, 13, 0);
    expect(toTorontoWall(computeDueAt(start, 20 * HOUR_MS, TORONTO))).toBe("2025-06-03, 16:00");
  });

  test("consumes a full working day exactly", () => {
    const start = Date.UTC(2025, 5, 2, 12, 0); // 08:00 EDT
    expect(toTorontoWall(computeDueAt(start, 13 * HOUR_MS, TORONTO))).toBe("2025-06-02, 21:00");
  });
});

describe("computeDueAt — DST", () => {
  test("crosses the spring-forward boundary at the correct local time", () => {
    // 2025-03-08 19:00 EST (UTC-5) = 2025-03-09 00:00 UTC. +4h active:
    // 2h to 21:00 Mar 8, then 2h from 08:00 Mar 9 (now EDT, UTC-4) = 10:00.
    // A naive fixed-offset calc would land an hour off.
    const start = Date.UTC(2025, 2, 9, 0, 0);
    expect(toTorontoWall(computeDueAt(start, 4 * HOUR_MS, TORONTO))).toBe("2025-03-09, 10:00");
  });
});

describe("computeDueAt — degenerate window", () => {
  test("treats a non-positive window as no quiet hours", () => {
    const start = Date.UTC(2025, 5, 2, 13, 0);
    const bh: BusinessHours = { timezone: "America/Toronto", startMinute: 600, endMinute: 600 };
    expect(computeDueAt(start, 3 * HOUR_MS, bh)).toBe(start + 3 * HOUR_MS);
  });
});
