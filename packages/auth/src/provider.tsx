"use client";

import * as React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * Wraps the app subtree with Clerk + Convex. Degrades gracefully:
 * - no Convex URL  → renders children only.
 * - no Clerk key   → Convex-only (unauthenticated) so the app still boots.
 * - fully configured → Clerk + Convex with token bridging.
 * Mounted in apps/app and apps/admin — NOT apps/web (keeps the landing lean).
 */
export function DewAuthProvider({ children }: { children: React.ReactNode }) {
  if (!convex) return <>{children}</>;

  if (!publishableKey) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[@dew/auth] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set — running without auth.",
      );
    }
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
