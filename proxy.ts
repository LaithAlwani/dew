import { type NextRequest, NextResponse } from "next/server";

// Host-based routing (Next 16 renamed middleware → proxy). One app serves three
// surfaces by hostname:
//   app.<domain>   → the professional workspace  (app/pro/*)
//   admin.<domain> → the internal admin surface  (app/admin/*)
//   everything else (apex) → marketing + the client journey
// The rewrite is internal: professionals see clean app.<domain>/… URLs.

function subdomainOf(host: string): "app" | "admin" | null {
  const label = host.split(":")[0].split(".")[0];
  return label === "app" || label === "admin" ? label : null;
}

export function proxy(request: NextRequest): NextResponse {
  const host = request.headers.get("host") ?? "";
  const sub = subdomainOf(host);
  const { pathname } = request.nextUrl;
  const suffix = pathname === "/" ? "" : pathname;

  if (sub === "app") {
    return pathname.startsWith("/pro")
      ? NextResponse.next()
      : NextResponse.rewrite(new URL(`/pro${suffix}`, request.url));
  }
  if (sub === "admin") {
    return pathname.startsWith("/admin")
      ? NextResponse.next()
      : NextResponse.rewrite(new URL(`/admin${suffix}`, request.url));
  }
  // Apex: don't leak the pro/admin surfaces at their raw path prefixes.
  if (pathname.startsWith("/pro") || pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/_wrong-host", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals, static assets, and the auth API.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
