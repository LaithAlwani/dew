"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { AuthPanel } from "./AuthPanel";
import { ProfileEditor } from "./ProfileEditor";

export function ProWorkspace() {
  const { data: session, isPending } = authClient.useSession();
  const ensureUser = useMutation(api.users.ensureCurrentUser);
  const claim = useMutation(api.professionals.claimProfessional);
  const profile = useQuery(api.professionals.getMyProfessional, session ? {} : "skip");
  const [ensured, setEnsured] = useState(false);

  // Make sure a Dew user row exists for the signed-in identity before we query
  // for a professional profile (step 4 folds this into the signup gate).
  useEffect(() => {
    if (session && !ensured) {
      ensureUser()
        .then(() => setEnsured(true))
        .catch(() => {});
    }
  }, [session, ensured, ensureUser]);

  if (isPending) {
    return <p className="font-body text-navy/60">Loading…</p>;
  }
  if (!session) {
    return <AuthPanel />;
  }

  return (
    <div className="flex flex-col gap-6">
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

      {profile === undefined ? (
        <p className="font-body text-navy/60">Loading your workspace…</p>
      ) : profile === null ? (
        <div className="flex flex-col items-start gap-4 rounded-lg bg-surface p-8 shadow-soft">
          <h2 className="font-display text-2xl text-navy">Set up your professional profile</h2>
          <p className="font-body text-navy/80">
            Create your profile to start receiving client introductions. An admin reviews every new
            professional before you go live.
          </p>
          <button
            type="button"
            onClick={() => claim()}
            className="rounded-md bg-coral px-5 py-2 font-body text-surface"
          >
            Become a professional
          </button>
        </div>
      ) : (
        <ProfileEditor profile={profile} />
      )}
    </div>
  );
}
