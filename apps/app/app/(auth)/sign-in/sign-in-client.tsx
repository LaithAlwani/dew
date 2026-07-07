"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@dew/auth";
import {
  AuthLayout,
  OAuthButtons,
  OrDivider,
  Field,
  SubmitButton,
  FormError,
  FooterSwitch,
  clerkErrorMessage,
} from "@/components/auth/auth-ui";

type Strategy = "oauth_google" | "oauth_apple";

const DEST = "/home";

const SIGNIN_BRAND = {
  title: "Welcome back to guidance that fits you.",
  subtitle: "Your experts, your routine, your progress — right where you left off.",
};

export function SignInClient({ initialSSO }: { initialSSO: Strategy | null }) {
  // Clerk Signals/Future API: `signIn` is a SignInFuture whose helpers resolve
  // to `{ error }` and update `signIn.status`.
  const { signIn } = useSignIn();
  const router = useRouter();

  const [mode, setMode] = React.useState<"signin" | "reset">("signin");
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
      const { error: err } = await signIn.sso({
        strategy,
        redirectUrl: DEST,
        redirectCallbackUrl: "/sso-callback",
      });
      if (err) {
        setBusyProvider(null);
        setError(clerkErrorMessage(err));
      }
    },
    [signIn],
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
        router.push(DEST);
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
        router.push(DEST);
      } else {
        setError("Couldn't reset your password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function backToSignIn() {
    setMode("signin");
    setResetSent(false);
    setError(null);
    setPassword("");
    setCode("");
  }

  // SSO redirect kicking off.
  if (initialSSO && busyProvider) {
    return (
      <AuthLayout
        brand={SIGNIN_BRAND}
        mobile={{ title: "Signing you in…", subtitle: "One moment." }}
        desktop={{ title: "One moment…", subtitle: "Taking you to your provider." }}
      >
        <div className="flex justify-center py-6">
          <span className="size-7 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
        </div>
        <FormError>{error}</FormError>
      </AuthLayout>
    );
  }

  // Forgot-password flow.
  if (mode === "reset") {
    return (
      <AuthLayout
        brand={SIGNIN_BRAND}
        mobile={{ title: "Reset your password", subtitle: resetSent ? <>Enter the code we sent to <b className="text-ink-700">{email}</b>.</> : "We'll email you a reset code." }}
        desktop={{ title: "Reset your password", subtitle: resetSent ? <>Enter the code we sent to <b className="text-ink-700">{email}</b>.</> : "We'll email you a reset code." }}
      >
        {!resetSent ? (
          <form onSubmit={requestReset}>
            <FormError>{error}</FormError>
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SubmitButton loading={loading}>Send reset code</SubmitButton>
          </form>
        ) : (
          <form onSubmit={submitReset} className="flex flex-col gap-4">
            <FormError>{error}</FormError>
            <Field
              label="Reset code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Field
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <SubmitButton loading={loading}>Reset password</SubmitButton>
          </form>
        )}
        <button
          type="button"
          onClick={backToSignIn}
          className="mt-4 w-full text-center text-[12.5px] font-semibold text-ink-400"
        >
          Back to log in
        </button>
      </AuthLayout>
    );
  }

  // Default: sign in.
  return (
    <AuthLayout
      brand={SIGNIN_BRAND}
      mobile={{ title: "Welcome back.", subtitle: "Log in to continue your Dew journey." }}
      desktop={{ title: "Log in", subtitle: "Continue your Dew journey." }}
    >
      <OAuthButtons
        onProvider={(s) => void startOAuth(s)}
        disabled={!!busyProvider}
        busyProvider={busyProvider}
      />
      <OrDivider />
      <form onSubmit={submitSignIn} className="flex flex-col gap-4">
        <FormError>{error}</FormError>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aside={
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setError(null);
              }}
              className="text-[12.5px] font-semibold text-purple-500"
            >
              Forgot?
            </button>
          }
        />
        <SubmitButton loading={loading}>Log in</SubmitButton>
      </form>
      <FooterSwitch prompt="New to Dew?" actionLabel="Create an account" href="/sign-up" />
    </AuthLayout>
  );
}
