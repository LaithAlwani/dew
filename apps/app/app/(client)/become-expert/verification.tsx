"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { api } from "@dew/backend/api";

/**
 * Expert identity-verification gate. Real verification (Didit) is not wired yet —
 * "Start verification" is a placeholder that approves the expert and drops them
 * into the expert dashboard.
 */
export function ExpertVerification() {
  const completeVerification = useMutation(api.users.completeExpertVerification);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function start() {
    if (loading) return;
    setLoading(true);
    try {
      await completeVerification({});
      router.push("/expert/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">
          Expert verification
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">
          Verify your identity
        </h1>
      </div>

      <div className="rounded-[24px] border border-white/90 bg-white/90 p-7 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
        <div className="flex items-center gap-2.5 text-purple-600">
          <ShieldCheck className="size-5" />
          <span className="font-display text-lg font-semibold text-ink-900">
            One quick step before you can guide clients
          </span>
        </div>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-500">
          Dew verifies every expert with <b className="text-ink-700">Didit</b> so clients
          know they&apos;re in trusted hands. It only takes a couple of minutes.
        </p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {["Confirm your identity", "Build trust with clients", "Unlock your expert dashboard"].map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-700">
              <BadgeCheck className="size-[18px] flex-none text-purple-500" />
              {t}
            </li>
          ))}
        </ul>
        <button
          onClick={start}
          disabled={loading}
          className="bg-primary-gradient mt-6 h-[52px] w-full rounded-[26px] text-[15px] font-semibold text-white shadow-glow transition disabled:opacity-70"
        >
          {loading ? "Starting…" : "Start verification"}
        </button>
        <p className="mt-3 text-center text-[11.5px] text-ink-400">
          Identity verification coming soon — for now this takes you straight in.
        </p>
      </div>
    </div>
  );
}
