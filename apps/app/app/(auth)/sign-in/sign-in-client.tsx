"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthChooser } from "@dew/ui";
import { useSignIn } from "@dew/auth";
import {
  AuthCard,
  Field,
  SubmitButton,
  FormError,
  FooterSwitch,
  clerkErrorMessage,
} from "@/components/auth/auth-ui";

type Strategy = "oauth_google" | "oauth_apple";
type Role = "client" | "expert";

// "Join as an expert" at sign-in sends the user into the expert flow: approved
// experts get forwarded to their dashboard, everyone else lands on verification.
const destFor = (role: Role) => (role === "expert" ? "/become-expert" : "/home");

export function SignInClient({
  initialSSO,
  initialMethod,
}: {
  initialSSO: Strategy | null;
  initialMethod: "email" | null;
}) {
  // Clerk Signals/Future API: `signIn` exposes password/sso/resetPassword/finalize.
  const { signIn } = useSignIn();
  const router = useRouter();

  const [role, setRole] = React.useState<Role>("client");
  const [view, setView] = React.useState<"chooser" | "email" | "reset">(
    initialMethod === "email" ? "email" : "chooser",
  );
  const dest = destFor(role);
  const [resetSent, setResetSent] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [busyProvider, setBusyProvider] = React.useState<Strategy | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const startOAuth = React.useCallback(
    async (strategy: Strategy) => {
      setError(null);
      setBusyProvider(strategy);
      const dest = destFor(role);
      const { error: err } = await signIn.sso({
        strategy,
        redirectUrl: dest,
        // Carry the client/expert choice through the OAuth round-trip so the
        // callback lands them in the right place (not the hardcoded fallback).
        redirectCallbackUrl: `/sso-callback?dest=${encodeURIComponent(dest)}`,
      });
      if (err) {
        setBusyProvider(null);
        setError(clerkErrorMessage(err));
      }
    },
    [signIn, role],
  );

  const autoFired = React.useRef(false);
  React.useEffect(() => {
    if (initialSSO && !autoFired.current) {
      autoFired.current = true;
      void startOAuth(initialSSO);
    }
  }, [initialSSO, startOAuth]);

  async function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await signIn.password({ identifier: email, password });
      if (err) {
        setError(clerkErrorMessage(err));
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        router.push(dest);
      } else {
        setError("Additional verification is required to sign in.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: createErr } = await signIn.create({ identifier: email });
      if (createErr) {
        setError(clerkErrorMessage(createErr));
        return;
      }
      const { error: sendErr } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendErr) {
        setError(clerkErrorMessage(sendErr));
        return;
      }
      setResetSent(true);
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyErr) {
        setError(clerkErrorMessage(verifyErr));
        return;
      }
      const { error: submitErr } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (submitErr) {
        setError(clerkErrorMessage(submitErr));
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        router.push(dest);
      } else {
        setError("Couldn't reset your password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // SSO redirect kicking off.
  if (busyProvider) {
    return (
      <AuthCard title="Signing you in…" subtitle="One moment.">
        <div className="flex justify-center py-6">
          <span className="size-7 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
        </div>
        <FormError>{error}</FormError>
      </AuthCard>
    );
  }

  // Forgot-password flow.
  if (view === "reset") {
    return (
      <AuthCard
        title="Reset your password"
        subtitle={resetSent ? <>Enter the code we sent to <b className="text-ink-700">{email}</b>.</> : "We'll email you a reset code."}
        onBack={() => { setView("email"); setResetSent(false); setError(null); }}
      >
        {!resetSent ? (
          <form onSubmit={requestReset}>
            <FormError>{error}</FormError>
            <Field label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <SubmitButton loading={loading}>Send reset code</SubmitButton>
          </form>
        ) : (
          <form onSubmit={submitReset} className="flex flex-col gap-4">
            <FormError>{error}</FormError>
            <Field label="Reset code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required />
            <Field label="New password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <SubmitButton loading={loading}>Reset password</SubmitButton>
          </form>
        )}
      </AuthCard>
    );
  }

  // Email / password login form (revealed by "Continue with email").
  if (view === "email") {
    return (
      <AuthCard
        title="Welcome back."
        subtitle="Log in to continue your Dew journey."
        onBack={() => setView("chooser")}
      >
        <form onSubmit={submitSignIn} className="flex flex-col gap-4">
          <FormError>{error}</FormError>
          <Field label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aside={
              <button type="button" onClick={() => { setView("reset"); setError(null); }} className="text-[12.5px] font-semibold text-purple-500">
                Forgot?
              </button>
            }
          />
          <SubmitButton loading={loading}>Log in</SubmitButton>
        </form>
        <FooterSwitch prompt="New to Dew?" actionLabel="Create an account" onAction={() => router.push("/sign-up")} />
      </AuthCard>
    );
  }

  // Default: the chooser sheet — same 3-button layout as sign-up (no role toggle).
  return (
    <AuthCard>
      <AuthChooser
        role={role}
        onRole={setRole}
        title="Welcome back."
        subtitle="Log in to continue your Dew journey."
        footerPrompt="New to Dew?"
        footerAction="Create an account"
        busy={busyProvider === "oauth_apple" ? "apple" : busyProvider === "oauth_google" ? "google" : null}
        onApple={() => void startOAuth("oauth_apple")}
        onGoogle={() => void startOAuth("oauth_google")}
        onEmail={() => setView("email")}
        onFooter={() => router.push("/sign-up")}
      />
    </AuthCard>
  );
}
