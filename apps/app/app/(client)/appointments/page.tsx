"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, CalendarPlus, Clock, Video } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dew/backend/api";
import type { Doc } from "@dew/backend/dataModel";
import { googleCalendarUrl } from "@/lib/calendar";

function whenLabel(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Appointments() {
  const appts = useQuery(api.appointments.mine);

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Appointments</div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">My appointments</h1>
      </div>

      {appts === undefined ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-[22px] bg-white/70" />
          ))}
        </div>
      ) : (
        <Content appts={appts} />
      )}
    </div>
  );
}

function Content({ appts }: { appts: Doc<"appointments">[] }) {
  // Read "now" once on mount (keeps render pure).
  const [now] = React.useState(() => Date.now());
  const upcoming = appts
    .filter((a) => a.status === "confirmed" && a.scheduledAt >= now)
    .sort((a, b) => a.scheduledAt - b.scheduledAt);
  const past = appts
    .filter((a) => !(a.status === "confirmed" && a.scheduledAt >= now))
    .sort((a, b) => b.scheduledAt - a.scheduledAt);

  if (appts.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/90 bg-white/85 p-10 text-center">
        <div className="font-display text-xl font-semibold text-ink-900">No appointments yet</div>
        <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-ink-500">
          Book a consult with an expert and it&apos;ll show up here.
        </p>
        <Link href="/experts" className="bg-primary-gradient mt-4 inline-flex h-11 items-center rounded-[22px] px-6 text-[13.5px] font-bold text-white shadow-glow">
          Find an expert
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[1px] text-ink-400">Upcoming</h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((a) => (
              <ApptCard key={a._id} a={a} now={now} cancellable />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[1px] text-ink-400">Past &amp; cancelled</h2>
          <div className="flex flex-col gap-3">
            {past.map((a) => (
              <ApptCard key={a._id} a={a} now={now} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ApptCard({ a, now, cancellable }: { a: Doc<"appointments">; now: number; cancellable?: boolean }) {
  const cancel = useMutation(api.appointments.cancel);
  const [busy, setBusy] = React.useState(false);
  const dimmed = a.status !== "confirmed";

  return (
    <div className={`rounded-[22px] border border-white/90 bg-white/85 p-5 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)] ${dimmed ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-3.5">
        <div className="size-[52px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold text-ink-900">{a.expertName}</span>
            <BadgeCheck className="size-[14px] flex-none text-purple-500" />
          </div>
          <div className="mt-0.5 truncate text-[12.5px] text-ink-500">{a.serviceName}</div>
        </div>
        <StatusPill status={a.status} isPast={a.scheduledAt < now} />
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-500">
        <span className="flex items-center gap-1.5"><Clock className="size-[15px] text-purple-500" />{whenLabel(a.scheduledAt)}</span>
        <span className="flex items-center gap-1.5"><Video className="size-[15px] text-purple-500" />{a.durationMin} min · {a.servicePrice}</span>
        {a.paymentStatus === "paid" && <span className="font-semibold text-success">Paid ✓</span>}
      </div>
      {cancellable && (
        <>
          <div className="mt-4 flex gap-2.5">
            {a.meetLink ? (
              <a href={a.meetLink} target="_blank" rel="noopener noreferrer" className="bg-primary-gradient flex h-10 flex-1 items-center justify-center rounded-full text-[13px] font-bold text-white">Join</a>
            ) : (
              <button disabled title="Video link added before your consult" className="h-10 flex-1 rounded-full bg-primary-gradient text-[13px] font-bold text-white opacity-50">Join</button>
            )}
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  await cancel({ id: a._id });
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="h-10 flex-1 rounded-full border border-purple-600/15 bg-white text-[13px] font-semibold text-ink-700 disabled:opacity-60"
            >
              {busy ? "Cancelling…" : "Cancel"}
            </button>
          </div>
          <a
            href={googleCalendarUrl(a)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 flex h-10 items-center justify-center gap-2 rounded-full border border-purple-600/15 bg-white text-[13px] font-semibold text-purple-600"
          >
            <CalendarPlus className="size-[15px]" />
            Add to Google Calendar
          </a>
        </>
      )}
    </div>
  );
}

function StatusPill({ status, isPast }: { status: string; isPast: boolean }) {
  const label =
    status === "cancelled"
      ? "Cancelled"
      : status === "completed" || isPast
        ? "Past"
        : "Confirmed";
  const cls =
    label === "Cancelled"
      ? "bg-error/10 text-error"
      : label === "Past"
        ? "bg-ink-400/15 text-ink-500"
        : "bg-success/15 text-success";
  return <span className={`flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold ${cls}`}>{label}</span>;
}
