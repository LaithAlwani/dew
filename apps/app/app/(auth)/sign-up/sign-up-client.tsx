"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthChooser } from "@dew/ui";
import { useSignUp } from "@dew/auth";
import {
  AuthCard,
  Field,
  SubmitButton,
  FormError,
  FooterSwitch,
  LegalNote,
  clerkErrorMessage,
} from "@/components/auth/auth-ui";

type Role = "client" | "expert";
type Strategy = "oauth_google" | "oauth_apple";

// Sign-up "expert" = create a client account + apply as an expert → /become-expert.
const destFor = (role: Role) => (role === "expert" ? "/become-expert" : "/onboarding");
const subtitleFor = (role: Role) =>
  role === "expert"
    ? "Set up your expert profile to start guiding clients."
    : "Create your account to meet your matches.";

export function SignUpClient({
  role: initialRole,
  initialSSO,
  initialMethod,
}: {
  role: Role;
  initialSSO: Strategy | null;
  initialMethod: "email" | null;
}) {
  // Clerk Signals/Future API: `signUp` exposes password/verifications/sso/finalize.
  const { signUp } = useSignUp();
  const router = useRouter();

  const [role, setRole] = React.useState<Role>(initialRole);
  const [view, setView] = React.useState<"chooser" | "email" | "verify">(
    initialMethod === "email" ? "email" : "chooser",
  );
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [busyProvider, setBusyProvider] = React.useState<Strategy | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const dest = destFor(role);

  const startOAuth = React.useCallback(
    async (strategy: Strategy) => {
      setError(null);
      setBusyProvider(strategy);
      const target = destFor(role);
      const { error: err } = await signUp.sso({
        strategy,
        redirectUrl: target,
        // Carry the client/expert choice through the OAuth round-trip.
        redirectCallbackUrl: `/sso-callback?dest=${encodeURIComponent(target)}`,
        unsafeMetadata: { role },
      });
      if (err) {
        setBusyProvider(null);
        setError(clerkErrorMessage(err));
      }
    },
    [signUp, role],
  );

  // Auto-start SSO when arriving from the marketing "Continue with Google/Apple".
  const autoFired = React.useRef(false);
  React.useEffect(() => {
    if (initialSSO && !autoFired.current) {
      autoFired.current = true;
      void startOAuth(initialSSO);
    }
  }, [initialSSO, startOAuth]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const { error: createErr } = await signUp.password({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(" ") : undefined,
        unsafeMetadata: { role },
      });
      if (createErr) {
        setError(clerkErrorMessage(createErr));
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize();
        router.push(dest);
        return;
      }
      const { error: sendErr } = await signUp.verifications.sendEmailCode();
      if (sendErr) {
        setError(clerkErrorMessage(sendErr));
        return;
      }
      setView("verify");
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyErr) {
        setError(clerkErrorMessage(verifyErr));
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize();
        router.push(dest);
      } else {
        setError("Couldn't verify that code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // SSO redirect kicking off.
  if (busyProvider) {
    return (
      <AuthCard title="Taking you to sign in…" subtitle="One moment.">
        <Spinner />
        <FormError>{error}</FormError>
      </AuthCard>
    );
  }

  // Email verification.
  if (view === "verify") {
    return (
      <AuthCard
        title="Check your email"
        subtitle={<>We sent a code to <b className="text-ink-700">{email}</b>.</>}
        onBack={() => setView("email")}
      >
        <form onSubmit={submitCode}>
          <FormError>{error}</FormError>
          <Field
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <SubmitButton loading={loading}>Verify &amp; continue</SubmitButton>
        </form>
      </AuthCard>
    );
  }

  // Email / password form (revealed by "Continue with email").
  if (view === "email") {
    const ctaLabel = role === "expert" ? "Create expert account" : "Create account";
    return (
      <AuthCard
        title="Let's make beauty feel easier."
        subtitle={subtitleFor(role)}
        onBack={() => setView("chooser")}
      >
        <form onSubmit={submitForm} className="flex flex-col gap-4">
          <FormError>{error}</FormError>
          <Field label="Name" autoComplete="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {/* Clerk bot-protection mount point (when enabled on the instance). */}
          <div id="clerk-captcha" />
          <SubmitButton loading={loading}>{ctaLabel}</SubmitButton>
        </form>
        <LegalNote />
        <FooterSwitch prompt="Already have an account?" actionLabel="Log in" onAction={() => router.push("/sign-in")} />
      </AuthCard>
    );
  }

  // Default: the chooser sheet — identical to the get-started CTA.
  return (
    <AuthCard>
      <AuthChooser
        role={role}
        onRole={setRole}
        onApple={() => void startOAuth("oauth_apple")}
        onGoogle={() => void startOAuth("oauth_google")}
        onEmail={() => setView("email")}
        onFooter={() => router.push("/sign-in")}
      />
    </AuthCard>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-6">
      <span className="size-7 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
    </div>
  );
}
