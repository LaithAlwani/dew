"use client";

import { AuthenticateWithRedirectCallback } from "@dew/auth";

/**
 * Lands the OAuth redirect from Clerk, completes the sign-in/up transfer, then
 * forwards to the destination each flow passed as `redirectUrlComplete`.
 * Falls back to /home (sign-in) and /onboarding (new sign-up) if none is set.
 */
export function SSOCallback() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <span className="size-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
      <p className="text-[13px] text-ink-500">Finishing sign in…</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/home"
        signUpFallbackRedirectUrl="/onboarding"
      />
    </main>
  );
}
