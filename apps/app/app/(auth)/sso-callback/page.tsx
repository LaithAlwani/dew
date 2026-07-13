import { SSOCallback } from "./sso-callback-client";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ dest?: string }>;
}) {
  const { dest } = await searchParams;
  // Only accept an internal path (guard against open redirects).
  const safeDest =
    typeof dest === "string" && dest.startsWith("/") && !dest.startsWith("//")
      ? dest
      : "/home";
  return <SSOCallback dest={safeDest} />;
}
