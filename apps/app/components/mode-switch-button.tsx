"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { ArrowLeftRight } from "lucide-react";
import { api } from "@dew/backend/api";

/**
 * Lets a dual (client + approved-expert) user switch which view they're in.
 * Persists `activeMode` (so their next visit lands here) then navigates.
 * Only render this for users who actually have both capabilities.
 */
export function ModeSwitchButton({ to }: { to: "client" | "expert" }) {
  const setActiveMode = useMutation(api.users.setActiveMode);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const label = to === "expert" ? "Switch to expert view" : "Switch to client view";
  const dest = to === "expert" ? "/expert/dashboard" : "/home";

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        // Persist the preference best-effort, but always navigate so the user
        // can switch even if the write hiccups.
        try {
          await setActiveMode({ mode: to });
        } catch {
          // ignore — navigation still happens below
        }
        router.push(dest);
      }}
      className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-purple-600/15 bg-white/70 p-4 text-sm font-bold text-purple-600 transition hover:bg-white disabled:opacity-70"
    >
      <ArrowLeftRight className="size-4" />
      {loading ? "Switching…" : label}
    </button>
  );
}
