import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const hasClerk =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

/**
 * Build a Next 16 proxy (renamed middleware) that protects all routes except
 * the given public matchers. Until Clerk keys are set, it passes everything
 * through so the app runs unauthenticated.
 *
 * Note: role gating (e.g. admin-only) is enforced server-side in layouts /
 * Convex functions — the proxy only does the optimistic signed-in check.
 */
export function createAuthProxy(options?: { publicRoutes?: string[] }) {
  if (!hasClerk) {
    return function proxy(_req: NextRequest) {
      return NextResponse.next();
    };
  }

  const isPublic = createRouteMatcher(options?.publicRoutes ?? []);
  return clerkMiddleware(async (auth, req) => {
    if (!isPublic(req)) {
      await auth.protect();
    }
  });
}

export { createRouteMatcher };
