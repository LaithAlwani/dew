"use client";

import { AuthenticateWithRedirectCallback } from "@dew/auth";

/**
 * Lands the OAuth redirect from Clerk, completes the sign-in/up transfer, then
 * forwards to `dest` — the client/expert destination the sign-in/up flow chose,
 * carried through the OAuth round-trip so the toggle is respected.
 */
export function SSOCallback({ dest }: { dest: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <span className="size-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
      <p className="text-[13px] text-ink-500">Finishing sign in…</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={dest}
        signUpFallbackRedirectUrl={dest}
      />
    </main>
  );
}
