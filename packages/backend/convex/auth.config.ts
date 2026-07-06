// Convex <-> Clerk JWT verification.
// Set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (or `npx convex env set`)
// to your Clerk Frontend API URL, e.g. https://your-app.clerk.accounts.dev
// Without this, ctx.auth.getUserIdentity() always returns null.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
