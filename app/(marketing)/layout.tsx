import Link from "next/link";
import type { ReactNode } from "react";

// Public marketing + client-journey surface (apex host). Indexed for SEO.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe sticky top-0 z-10 border-navy/10 border-b bg-surface/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl text-navy">
            Dew
          </Link>
          <Link href="/discover" className="font-body text-navy text-sm hover:text-coral">
            Get matched
          </Link>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
