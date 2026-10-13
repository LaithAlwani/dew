"use client";

import { useMutation, useQuery } from "convex/react";
import { AuthPanel } from "@/components/pro/AuthPanel";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

// Pending-professional review. Admin role is seeded directly (dashboard/DB) —
// there's no UI to grant it, by design.
export function AdminApprovals() {
  const { data: session, isPending } = authClient.useSession();
  const me = useQuery(api.users.getMe, session ? {} : "skip");
  const isAdmin = me?.role === "admin";
  const pending = useQuery(api.professionals.listPendingProfessionals, isAdmin ? {} : "skip");
  const approve = useMutation(api.professionals.approveProfessional);
  const reject = useMutation(api.professionals.rejectProfessional);

  if (isPending) {
    return <p className="font-body text-navy/60">Loading…</p>;
  }
  if (!session) {
    return <AuthPanel />;
  }
  if (me === undefined) {
    return <p className="font-body text-navy/60">Loading…</p>;
  }
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="font-body text-navy/80">Admins only. Signed in as {session.user.email}.</p>
        <button
          type="button"
          onClick={() => authClient.signOut()}
          className="font-body text-navy/70 text-sm hover:text-coral"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-body text-navy/60 text-sm">{session.user.email}</span>
        <button
          type="button"
          onClick={() => authClient.signOut()}
          className="font-body text-navy/70 text-sm hover:text-coral"
        >
          Sign out
        </button>
      </div>

      {pending === undefined ? (
        <p className="font-body text-navy/60">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="font-body text-navy/70">No professionals awaiting review.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((pro) => (
            <li
              key={pro._id}
              className="flex items-center justify-between rounded-lg bg-surface p-4 shadow-soft"
            >
              <div>
                <p className="font-display text-lg text-navy">{pro.displayName || "(unnamed)"}</p>
                <p className="font-body text-navy/60 text-sm">
                  {pro.services.length > 0 ? pro.services.join(", ") : "no services yet"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => approve({ professionalId: pro._id })}
                  className="rounded-md bg-sage px-3 py-1 font-body text-navy text-sm"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reject({ professionalId: pro._id })}
                  className="rounded-md bg-coral/40 px-3 py-1 font-body text-navy text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
