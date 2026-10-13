import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL as string;

// The client, professional (app.) and admin (admin.) surfaces are separate
// origins of one app; each must be trusted for auth requests. Comma-separated
// env var, e.g. the three localhost hosts in dev and the real domains in prod.
const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// The Better Auth component owns the auth user/session/account tables.
// Dew's own `users` row (with `role`) is kept in sync in convex/users.ts.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : undefined,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig })],
  });
