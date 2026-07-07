"use client";

import * as React from "react";
import { useClerk } from "@dew/auth";

/**
 * Signs the current user out via Clerk, then redirects to the login page.
 * Rendered inside the (server) profile page.
 */
export function LogoutButton() {
  const { signOut } = useClerk();
  const [loading, setLoading] = React.useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void signOut({ redirectUrl: "/sign-in" });
      }}
      className="w-full rounded-[18px] border border-purple-600/10 bg-white/70 p-4 text-sm font-bold text-berry-600 transition hover:bg-white disabled:opacity-70"
    >
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
