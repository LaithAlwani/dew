"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useUser } from "@dew/auth";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { api } from "@dew/backend/api";
import type { Doc } from "@dew/backend/dataModel";

const TIMES = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"];
const DAY_LABEL = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** "30 min · video" → 30 (default 30). */
function parseDuration(meta: string): number {
  const m = meta.match(/(\d+)\s*min/i);
  return m ? Number(m[1]) : 30;
}

/** "2:00 PM" → { h: 14, m: 0 } */
function parseTime(t: string): { h: number; m: number } {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return { h: 12, m: 0 };
  let h = Number(m[1]) % 12;
  if (m[3]!.toUpperCase() === "PM") h += 12;
  return { h, m: Number(m[2]) };
}

/** Epoch ms for a given day + time-slot string. */
function slotMs(dayDate: Date, timeStr: string): number {
  const { h, m } = parseTime(timeStr);
  const d = new Date(dayDate);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function BookingFlow({ expert }: { expert: Doc<"experts"> }) {
  const router = useRouter();
  const book = useMutation(api.appointments.book);
  const { user } = useUser();

  const services =
    expert.services.length > 0
      ? expert.services
      : [{ name: "Consult", meta: "30 min · video", price: expert.priceLabel }];

  // Next 14 days; Sundays are unavailable. Default to the first open day.
  const days = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return { date: d, off: d.getDay() === 0 };
    });
  }, []);

  const [serviceIdx, setServiceIdx] = React.useState(0);
  const [dayIdx, setDayIdx] = React.useState(() => days.findIndex((d, i) => i > 0 && !d.off));
  const [timeIdx, setTimeIdx] = React.useState(2);
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const svc = services[serviceIdx]!;
  const day = days[dayIdx]!;
  const time = TIMES[timeIdx]!;
  const durationMin = parseDuration(svc.meta);
  const isFree = /free/i.test(svc.price) || !/\d/.test(svc.price);

  const scheduledAt = React.useMemo(() => slotMs(day.date, time), [day, time]);

  // Slots already taken with this expert on the selected day.
  const dayStart = React.useMemo(() => new Date(day.date).setHours(0, 0, 0, 0), [day]);
  const takenRaw = useQuery(api.appointments.takenSlots, {
    expertId: expert._id,
    dayStart,
    dayEnd: dayStart + 86400000,
  });
  const takenSet = React.useMemo(() => new Set(takenRaw ?? []), [takenRaw]);
  const selectedTaken = takenSet.has(scheduledAt);

  const whenLabel = new Date(scheduledAt).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  async function confirm() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await book({
        expertId: expert._id,
        serviceName: svc.name,
        servicePrice: svc.price,
        scheduledAt,
        durationMin,
        note: note.trim() || undefined,
        clientEmail: user?.primaryEmailAddress?.emailAddress,
        clientName: user?.fullName ?? user?.firstName ?? undefined,
      });
      router.push("/appointments?booked=1");
    } catch (e) {
      setLoading(false);
      setError(
        e instanceof ConvexError
          ? (e.data as string)
          : "Couldn't complete the booking. Please try again.",
      );
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_372px]">
      {/* LEFT: steps */}
      <div className="flex flex-col gap-7">
        <section>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-ink-400">Step 1</div>
          <h2 className="font-display mb-4 text-[26px] font-semibold text-ink-900">Choose a service</h2>
          <div className="flex flex-col gap-3">
            {services.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setServiceIdx(i)}
                className={`flex items-center justify-between rounded-[18px] px-5 py-[18px] text-left transition ${
                  serviceIdx === i ? "border-[1.5px] border-purple-500 bg-purple-500/[0.09]" : "border border-purple-600/10 bg-white/85"
                }`}
              >
                <div>
                  <div className="text-[15px] font-bold text-ink-900">{s.name}</div>
                  <div className="mt-0.5 text-xs text-ink-500">{s.meta}</div>
                </div>
                <span className="text-[15px] font-bold text-purple-600">{s.price}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-ink-400">Step 2</div>
          <h2 className="font-display mb-1 text-[26px] font-semibold text-ink-900">Pick a date &amp; time</h2>
          <div className="mb-4 text-[12.5px] text-ink-500">Times shown in your timezone</div>
          <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1">
            {days.map((d, i) => (
              <button
                key={i}
                disabled={d.off}
                onClick={() => setDayIdx(i)}
                className={`w-[64px] flex-none rounded-2xl py-3.5 text-center transition ${
                  dayIdx === i ? "bg-primary-gradient" : "border border-purple-600/10 bg-white/85"
                } ${d.off ? "opacity-40" : ""}`}
              >
                <div className={`text-[10.5px] font-semibold ${dayIdx === i ? "text-white/80" : "text-ink-400"}`}>{DAY_LABEL[d.date.getDay()]}</div>
                <div className={`mt-1 text-lg font-bold ${dayIdx === i ? "text-white" : d.off ? "text-ink-400" : "text-ink-900"}`}>{d.date.getDate()}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {TIMES.map((t, i) => {
              const taken = takenSet.has(slotMs(day.date, t));
              return (
                <button
                  key={t}
                  onClick={() => setTimeIdx(i)}
                  disabled={taken}
                  title={taken ? "Already booked" : undefined}
                  className={`rounded-[14px] py-3.5 text-center text-[13.5px] font-semibold transition ${
                    taken
                      ? "cursor-not-allowed border border-purple-600/10 bg-white/50 text-ink-400 line-through"
                      : timeIdx === i
                        ? "bg-primary-gradient text-white"
                        : "border border-purple-600/10 bg-white/85 text-ink-900"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-ink-400">Step 3</div>
          <h2 className="font-display mb-4 text-[26px] font-semibold text-ink-900">
            Help {expert.name.split(" ")[0]} prepare <span className="font-sans text-sm font-medium text-ink-400">· optional</span>
          </h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What do you want help with most? e.g. persistent breakouts along my jaw"
            className="h-24 w-full resize-none rounded-2xl border border-purple-600/10 bg-white/90 p-4 text-sm text-ink-900 outline-none placeholder:text-ink-400/70"
          />
        </section>
      </div>

      {/* RIGHT: summary */}
      <div className="rounded-[26px] border border-white/90 bg-white/90 p-6 shadow-[0_18px_40px_-14px_rgba(120,80,160,0.28)] xl:sticky xl:top-4">
        <div className="flex items-center gap-3 border-b border-purple-600/[0.08] pb-[18px]">
          <div className="size-[52px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-base font-bold text-ink-900">{expert.name}</span>
              <BadgeCheck className="size-[13px] flex-none text-purple-500" />
            </div>
            <div className="mt-0.5 truncate text-[11.5px] text-ink-500">{expert.title} · ★ {expert.rating.toFixed(1)}</div>
          </div>
        </div>
        <div className="border-b border-purple-600/[0.08] py-[18px] text-[13.5px]">
          <Row label="Service" value={svc.name} />
          <Row label="When" value={`${whenLabel} · ${time}`} />
          <Row label="Format" value={`Video · ${durationMin} min`} last />
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-[15px] font-bold text-ink-900">Total due</span>
          <span className="text-xl font-bold text-purple-600">{isFree ? "Free" : svc.price}</span>
        </div>
        {error && <p className="mb-3 rounded-xl bg-error/10 px-3.5 py-2.5 text-[12.5px] font-medium text-error">{error}</p>}
        <button
          onClick={confirm}
          disabled={loading || selectedTaken}
          className="bg-primary-gradient h-[52px] w-full rounded-[26px] text-[15px] font-bold text-white shadow-glow transition disabled:opacity-70"
        >
          {loading
            ? "Processing…"
            : selectedTaken
              ? "Slot unavailable"
              : isFree
                ? "Confirm booking"
                : `Pay ${svc.price} & confirm`}
        </button>
        <div className="mt-4 flex items-center gap-2.5 rounded-[14px] bg-[linear-gradient(135deg,rgba(123,82,196,0.1),rgba(200,120,190,0.1))] px-3.5 py-3">
          <ShieldCheck className="size-4 flex-none text-purple-500" />
          <span className="flex-1 text-[11.5px] text-ink-700">
            {isFree ? "Free to reschedule up to 24h before." : "Secure checkout · powered by Stripe."}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${last ? "" : "mb-2.5"}`}>
      <span className="flex-none text-ink-500">{label}</span>
      <span className="text-right font-semibold text-ink-900">{value}</span>
    </div>
  );
}
