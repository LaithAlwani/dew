import { SignInClient } from "./sign-in-client";

// Rendered at request time (Clerk needs runtime keys, not build-time prerender).
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sso?: string }>;
}) {
  const { sso } = await searchParams;
  const initialSSO =
    sso === "google" ? "oauth_google" : sso === "apple" ? "oauth_apple" : null;

  return <SignInClient initialSSO={initialSSO} />;
}
