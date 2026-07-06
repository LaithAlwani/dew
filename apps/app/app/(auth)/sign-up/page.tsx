import { SignUp } from "@dew/auth";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <SignUp routing="hash" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
    </main>
  );
}
