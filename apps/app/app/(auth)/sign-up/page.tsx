import { SignUpClient } from "./sign-up-client";

// Rendered at request time (Clerk needs runtime keys, not build-time prerender).
export const dynamic = "force-dynamic";

type Role = "client" | "expert";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; sso?: string; method?: string }>;
}) {
  const { role, sso, method } = await searchParams;
  const initialRole: Role = role === "expert" ? "expert" : "client";
  const initialSSO =
    sso === "google" ? "oauth_google" : sso === "apple" ? "oauth_apple" : null;
  const initialMethod = method === "email" ? "email" : null;

  return <SignUpClient role={initialRole} initialSSO={initialSSO} initialMethod={initialMethod} />;
}
