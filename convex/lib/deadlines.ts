// All deadline math goes through this one utility. Nothing computes a deadline
// inline. Timers pause during quiet hours (outside the professional's working
// window), so a deadline consumes only *active* time and never lands in the
// middle of the night. Timezone- and DST-aware via Intl; no external libs.

export interface BusinessHours {
  timezone: string; // IANA, e.g. "America/Toronto"
  startMinute: number; // working-window open, minutes from local midnight
  endMinute: number; // working-window close, minutes from local midnight
}

export const HOUR_MS = 3_600_000;

// Window lengths (active time) per deadline kind, from the locked timing table.
export const DEADLINE_WINDOWS_MS = {
  preview_reminder: 12 * HOUR_MS,
  preview_expiry: 24 * HOUR_MS,
  contact_reminder: 12 * HOUR_MS,
  contact_deadline: 24 * HOUR_MS,
  client_reminder: 24 * HOUR_MS,
  client_ghost: 72 * HOUR_MS,
  lifecycle_cap: 10 * 24 * HOUR_MS,
} as const;

// Offset (localWallClock - UTC) in ms that `timeZone` has at instant `utcMs`.
function tzOffsetMs(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const f: Record<string, number> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) {
    if (part.type !== "literal") {
      f[part.type] = Number(part.value);
    }
  }
  const asUtc = Date.UTC(f.year, f.month - 1, f.day, f.hour, f.minute, f.second);
  return asUtc - utcMs;
}

// The local calendar date (Y/M/D) at instant `utcMs` in `timeZone`.
function localYMD(utcMs: number, timeZone: string): { year: number; month: number; day: number } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const f: Record<string, number> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) {
    if (part.type !== "literal") {
      f[part.type] = Number(part.value);
    }
  }
  return { year: f.year, month: f.month, day: f.day };
}

// The UTC instant for a given local wall-clock time in `timeZone`. Two passes
// resolve the DST edge (the offset at the guess may differ from the answer's).
function wallToUtc(
  year: number,
  month: number,
  day: number,
  minutesFromMidnight: number,
  timeZone: string,
): number {
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = tzOffsetMs(guess - tzOffsetMs(guess, timeZone), timeZone);
  return guess - offset;
}

// The deadline `windowMs` of active time after `startMs`, skipping quiet hours.
export function computeDueAt(startMs: number, windowMs: number, bh: BusinessHours): number {
  // Overnight/degenerate windows aren't a working day; treat as no quiet hours.
  if (bh.startMinute >= bh.endMinute) {
    return startMs + windowMs;
  }
  let remaining = windowMs;
  let cursor = startMs;
  for (let guard = 0; guard < 500 && remaining > 0; guard++) {
    const { year, month, day } = localYMD(cursor, bh.timezone);
    const open = wallToUtc(year, month, day, bh.startMinute, bh.timezone);
    const close = wallToUtc(year, month, day, bh.endMinute, bh.timezone);
    if (cursor < open) {
      cursor = open; // before the window opens — jump to open (no consumption)
      continue;
    }
    if (cursor >= close) {
      const next = localYMD(cursor + 24 * HOUR_MS, bh.timezone);
      cursor = wallToUtc(next.year, next.month, next.day, bh.startMinute, bh.timezone);
      continue;
    }
    const available = close - cursor;
    if (remaining <= available) {
      return cursor + remaining;
    }
    remaining -= available;
    cursor = close;
  }
  return cursor;
}
