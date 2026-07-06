import { SignIn } from "@dew/auth";

// Rendered at request time (Clerk needs runtime keys, not build-time prerender).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <SignIn routing="hash" signUpUrl="/sign-up" fallbackRedirectUrl="/home" />
    </main>
  );
}
