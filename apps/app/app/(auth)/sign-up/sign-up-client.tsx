"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@dew/auth";
import {
  AuthLayout,
  OAuthButtons,
  OrDivider,
  RoleToggle,
  Field,
  SubmitButton,
  FormError,
  FooterSwitch,
  LegalNote,
  clerkErrorMessage,
} from "@/components/auth/auth-ui";

type Role = "client" | "expert";
type Strategy = "oauth_google" | "oauth_apple";

const destFor = (role: Role) => (role === "expert" ? "/expert/apply" : "/onboarding");

export function SignUpClient({
  role: initialRole,
  initialSSO,
}: {
  role: Role;
  initialSSO: Strategy | null;
}) {
  // Clerk Signals/Future API: `signUp` is a SignUpFuture with method-style
  // helpers (password/verifications/sso/finalize) that resolve to `{ error }`.
  const { signUp } = useSignUp();
  const router = useRouter();

  const [role, setRole] = React.useState<Role>(initialRole);
  const [step, setStep] = React.useState<"form" | "verify">("form");
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
      const { error: err } = await signUp.sso({
        strategy,
        redirectUrl: destFor(role), // where Clerk lands the user once the flow completes
        redirectCallbackUrl: "/sso-callback", // page that finalizes the OAuth return
        unsafeMetadata: { role },
      });
      if (err) {
        setBusyProvider(null);
        setError(clerkErrorMessage(err));
      }
    },
    [signUp, role],
  );

  // Auto-start SSO when arriving from the "Continue with Google/Apple" buttons.
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
      setStep("verify");
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

  // While an SSO redirect is being kicked off, show a minimal waiting state.
  if (initialSSO && busyProvider) {
    return (
      <AuthLayout
        brand={SIGNUP_BRAND}
        mobile={{ title: "Taking you to sign in…", subtitle: "One moment." }}
        desktop={{ title: "One moment…", subtitle: "Taking you to your provider." }}
      >
        <Spinner />
        <FormError>{error}</FormError>
      </AuthLayout>
    );
  }

  if (step === "verify") {
    return (
      <AuthLayout
        brand={SIGNUP_BRAND}
        mobile={{ title: "Check your email", subtitle: <>We sent a code to <b className="text-ink-700">{email}</b>.</> }}
        desktop={{ title: "Check your email", subtitle: <>We sent a code to <b className="text-ink-700">{email}</b>.</> }}
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
          <button
            type="button"
            onClick={() => setStep("form")}
            className="mt-4 w-full text-center text-[12.5px] font-semibold text-ink-400"
          >
            Use a different email
          </button>
        </form>
      </AuthLayout>
    );
  }

  const ctaLabel = role === "expert" ? "Create expert account" : "Create account";

  return (
    <AuthLayout
      brand={SIGNUP_BRAND}
      mobile={{ title: "Let's make beauty feel easier.", subtitle: "Create your account to meet your matches." }}
      desktop={{ title: "Create your account", subtitle: "Tell us who you are so we can get you started." }}
    >
      <RoleToggle role={role} onChange={setRole} />
      <OAuthButtons
        onProvider={(s) => void startOAuth(s)}
        disabled={!!busyProvider}
        busyProvider={busyProvider}
      />
      <OrDivider />
      <form onSubmit={submitForm} className="flex flex-col gap-4">
        <FormError>{error}</FormError>
        <Field
          label="Name"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Clerk bot-protection needs a mount point when enabled on the instance. */}
        <div id="clerk-captcha" />
        <SubmitButton loading={loading}>{ctaLabel}</SubmitButton>
      </form>
      <LegalNote />
      <FooterSwitch prompt="Already have an account?" actionLabel="Log in" href="/sign-in" />
    </AuthLayout>
  );
}

const SIGNUP_BRAND = {
  title: "Let's make beauty feel easier.",
  subtitle: "Create your account to meet experts matched to your real goals and budget.",
};

function Spinner() {
  return (
    <div className="flex justify-center py-6">
      <span className="size-7 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
    </div>
  );
}
