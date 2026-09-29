import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

// Server-side auth helpers for the App Router: the route handler, an initial
// token for SSR hydration, and authenticated server-side Convex calls.
export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL as string,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL as string,
});
