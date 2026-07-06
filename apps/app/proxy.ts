import { createAuthProxy } from "@dew/auth/proxy";

// Next 16 proxy (formerly middleware). Auth is enforced once Clerk keys exist;
// until then it passes through. Sign-in/up are public.
export default createAuthProxy({
  // Only auth entry points are public; everything else requires sign-in.
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
