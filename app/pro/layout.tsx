import type { ReactNode } from "react";

// The professional workspace — served on app.<domain> (proxy rewrites the host
// root to /pro). Authenticated + noindex. Role-gating (requireRole "professional")
// arrives with the workspace features in step 2.
export const metadata = { robots: { index: false, follow: false } };

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-foundation">
      <header className="pt-safe sticky top-0 z-10 border-navy/10 border-b bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg text-navy">Dew for Professionals</span>
          <span className="rounded-md bg-lavender px-2 py-1 font-body text-navy text-xs">
            Workspace
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
