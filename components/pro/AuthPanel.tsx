"use client";

import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

// Minimal email/password auth for the professional workspace. Fuller auth UX
// (verification, reset, social) comes with step 4.
export function AuthPanel() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) {
      setError(res.error.message ?? "Something went wrong. Try again.");
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg bg-surface p-8 shadow-soft">
      <h2 className="font-display text-2xl text-navy">
        {mode === "sign-up" ? "Join Dew as a professional" : "Welcome back"}
      </h2>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        {mode === "sign-up" && (
          <input
            className="rounded-md border border-navy/15 bg-foundation px-3 py-2 font-body text-navy"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="rounded-md border border-navy/15 bg-foundation px-3 py-2 font-body text-navy"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="rounded-md border border-navy/15 bg-foundation px-3 py-2 font-body text-navy"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="font-body text-coral text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-coral px-4 py-2 font-body text-surface disabled:opacity-60"
        >
          {busy ? "…" : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 font-body text-navy/70 text-sm hover:text-coral"
        onClick={() => {
          setMode(mode === "sign-up" ? "sign-in" : "sign-up");
          setError(null);
        }}
      >
        {mode === "sign-up" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </div>
  );
}
