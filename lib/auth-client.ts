import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Browser-side auth client. The convexClient plugin bridges Better Auth
// sessions into Convex's auth so subscriptions see the signed-in identity.
export const authClient = createAuthClient({
  plugins: [convexClient()],
});
