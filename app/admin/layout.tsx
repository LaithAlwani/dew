import type { ReactNode } from "react";

// Internal admin — served on admin.<domain> (proxy rewrites the host root to
// /admin). requireAdmin gating arrives with step 11. noindex.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-foundation">
      <header className="pt-safe sticky top-0 z-10 border-navy/10 border-b bg-navy">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
          <span className="font-display text-lg text-surface">Dew Admin</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
