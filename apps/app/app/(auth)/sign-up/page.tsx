import { SignUpClient } from "./sign-up-client";

// Rendered at request time (Clerk needs runtime keys, not build-time prerender).
export const dynamic = "force-dynamic";

type Role = "client" | "expert";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; sso?: string }>;
}) {
  const { role, sso } = await searchParams;
  const initialRole: Role = role === "expert" ? "expert" : "client";
  const initialSSO =
    sso === "google" ? "oauth_google" : sso === "apple" ? "oauth_apple" : null;

  return <SignUpClient role={initialRole} initialSSO={initialSSO} />;
}
