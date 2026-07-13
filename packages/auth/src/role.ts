import { auth, currentUser } from "@clerk/nextjs/server";
import { unstable_rethrow } from "next/navigation";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@dew/backend/api";

export type ExpertStatus = "none" | "pending" | "approved";
export type ActiveMode = "client" | "expert";

export type Access = {
  /** Every signed-in user is a client. */
  isClient: true;
  /** Approved expert — may enter the expert area. */
  isExpert: boolean;
  expertStatus: ExpertStatus;
  isAdmin: boolean;
  /** Remembered view for dual users. */
  activeMode: ActiveMode;
};

/**
 * Server-side capabilities of the signed-in user, from the Convex `users` table
 * (the source of truth). On first authenticated visit the row is provisioned —
 * the sign-up "expert" choice (Clerk `unsafeMetadata.role === "expert"`) starts
 * the expert application as pending. Returns `null` when signed out, or on a
 * transient backend error, so callers fail safe.
 *
 * Uses the Clerk `convex` JWT template to authenticate the Convex calls.
 */
export async function getUserAccess(): Promise<Access | null> {
  try {
    const { userId, getToken } = await auth();
    if (!userId) return null;
    const token = await getToken({ template: "convex" });
    if (!token) return null;

    let user = await fetchQuery(api.users.current, {}, { token });
    if (!user) {
      const cu = await currentUser();
      await fetchMutation(
        api.users.ensureUser,
        { applyAsExpert: cu?.unsafeMetadata?.role === "expert" },
        { token },
      );
      user = await fetchQuery(api.users.current, {}, { token });
    }
    if (!user) return null;

    return {
      isClient: true,
      isExpert: user.expertStatus === "approved",
      expertStatus: user.expertStatus,
      isAdmin: user.isAdmin,
      activeMode: user.activeMode,
    };
  } catch (err) {
    // Never swallow Next's control-flow errors (dynamic-usage, redirect,
    // notFound) — swallowing DynamicServerError makes gated routes prerender as
    // a static redirect. Re-throw those; only real failures fall through.
    unstable_rethrow(err);
    console.error("[dew getUserAccess] failed:", err);
    return null;
  }
}
