import { auth, currentUser } from "@clerk/nextjs/server";

export { auth, currentUser };

/**
 * The role stored on the Clerk session (publicMetadata.role), or null.
 * Used for optimistic server-side gating; Convex re-checks on every write.
 */
export async function getSessionRole(): Promise<string | null> {
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.metadata ??
    (sessionClaims as Record<string, unknown> | null)?.publicMetadata) as
    | { role?: string }
    | undefined;
  return meta?.role ?? null;
}
