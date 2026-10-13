"use client";

import { professionalProfileSchema, SERVICE_KEYS } from "@dew/validation";
import { useMutation } from "convex/react";
import { type FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const SERVICE_LABELS: Record<string, string> = {
  bridal_makeup: "Bridal makeup",
  event_makeup: "Event makeup",
  everyday_makeup: "Everyday makeup",
  editorial_makeup: "Editorial makeup",
  special_effects: "Special effects",
  makeup_lesson: "Makeup lesson",
  skincare_consult: "Skincare consult",
};

const STATUS: Record<string, { label: string; className: string }> = {
  invited: { label: "Invited — complete your profile", className: "bg-powder" },
  pending_review: { label: "Pending review — we'll approve you shortly", className: "bg-butter" },
  approved: { label: "Approved — you can receive clients", className: "bg-sage" },
  rejected: { label: "Not approved — contact support", className: "bg-coral/40" },
  paused: { label: "Paused — pending review", className: "bg-coral/40" },
};

export function ProfileEditor({ profile }: { profile: Doc<"professionals"> }) {
  const update = useMutation(api.professionals.updateProfile);
  const resubmit = useMutation(api.professionals.resubmitForReview);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [services, setServices] = useState<string[]>(profile.services);
  const [timezone, setTimezone] = useState(profile.businessHours.timezone);
  const [start, setStart] = useState(minutesToTime(profile.businessHours.startMinute));
  const [end, setEnd] = useState(minutesToTime(profile.businessHours.endMinute));
  const [bookingLink, setBookingLink] = useState(profile.bookingLink ?? "");
  const [capacity, setCapacity] = useState(profile.capacity);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const status = STATUS[profile.approvalState] ?? STATUS.pending_review;

  function toggleService(key: string) {
    setServices((cur) => (cur.includes(key) ? cur.filter((s) => s !== key) : [...cur, key]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const input = {
      displayName,
      bio: bio || undefined,
      services,
      businessHours: { timezone, startMinute: timeToMinutes(start), endMinute: timeToMinutes(end) },
      bookingLink: bookingLink || undefined,
      capacity,
    };
    const parsed = professionalProfileSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    setBusy(true);
    try {
      await update(parsed.data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={`rounded-md px-4 py-2 font-body text-navy text-sm ${status.className}`}>
        {status.label}
      </div>

      {profile.approvalState === "rejected" && (
        <div className="flex items-center gap-3">
          <p className="font-body text-navy/80 text-sm">
            Update your profile below, then resubmit for another review.
          </p>
          <button
            type="button"
            onClick={() => resubmit()}
            className="rounded-md bg-coral px-4 py-2 font-body text-surface text-sm"
          >
            Resubmit for review
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-5 rounded-lg bg-surface p-6 shadow-soft"
      >
        <label className="flex flex-col gap-1 font-body text-navy text-sm">
          Display name
          <input
            className="rounded-md border border-navy/15 bg-foundation px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 font-body text-navy text-sm">
          Bio
          <textarea
            className="min-h-20 rounded-md border border-navy/15 bg-foundation px-3 py-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <fieldset className="flex flex-col gap-2 font-body text-navy text-sm">
          <legend>Services</legend>
          <div className="flex flex-wrap gap-2">
            {SERVICE_KEYS.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => toggleService(key)}
                className={`rounded-md px-3 py-1 ${
                  services.includes(key) ? "bg-lavender" : "bg-foundation border border-navy/15"
                }`}
              >
                {SERVICE_LABELS[key] ?? key}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-4 font-body text-navy text-sm">
          <label className="flex flex-col gap-1">
            Timezone
            <input
              className="rounded-md border border-navy/15 bg-foundation px-3 py-2"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            Working from
            <input
              type="time"
              className="rounded-md border border-navy/15 bg-foundation px-3 py-2"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            to
            <input
              type="time"
              className="rounded-md border border-navy/15 bg-foundation px-3 py-2"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            Capacity
            <input
              type="number"
              min={1}
              max={20}
              className="w-24 rounded-md border border-navy/15 bg-foundation px-3 py-2"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 font-body text-navy text-sm">
          Booking link
          <input
            className="rounded-md border border-navy/15 bg-foundation px-3 py-2"
            placeholder="https://…"
            value={bookingLink}
            onChange={(e) => setBookingLink(e.target.value)}
          />
        </label>

        {error && <p className="font-body text-coral text-sm">{error}</p>}
        {saved && <p className="font-body text-navy/70 text-sm">Saved.</p>}

        <button
          type="submit"
          disabled={busy}
          className="self-start rounded-md bg-coral px-5 py-2 font-body text-surface disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
