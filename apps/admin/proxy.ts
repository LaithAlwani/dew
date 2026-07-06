import { createAuthProxy } from "@dew/auth/proxy";

// Admin: every route requires sign-in (once Clerk keys exist). Admin-role
// gating is enforced server-side in the (admin) layout + Convex functions.
export default createAuthProxy();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
