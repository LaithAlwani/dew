import Image from "next/image";
import Link from "next/link";
import { APP_URL } from "../app/site-config";

/**
 * Shared chrome + prose styling for legal pages (terms, privacy). Child content
 * is plain HTML (h2/p/ul/strong/a) — the container styles it via variant utils.
 */
export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#F1EAFB_0%,#FBF9FE_420px,#F6EEF6_100%)]">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/60 bg-[rgba(247,242,252,0.72)] px-6 py-4 backdrop-blur-md sm:px-14">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.webp" alt="Dew" width={52} height={30} className="h-[30px] w-auto" />
          <span className="font-display text-[24px] font-semibold tracking-wide text-purple-700">Dew</span>
        </Link>
        <div className="flex-1" />
        <Link href="/" className="text-sm font-semibold text-ink-700 hover:text-purple-600">Home</Link>
        <Link
          href="/get-started"
          className="bg-primary-gradient inline-flex h-10 items-center rounded-[20px] px-5 text-sm font-bold text-white shadow-glow"
        >
          Get started
        </Link>
      </header>

      <main className="mx-auto max-w-[760px] px-6 py-14 sm:px-8">
        <h1 className="font-display text-4xl font-medium leading-tight text-ink-900 sm:text-[46px]">
          {title}
        </h1>
        <p className="mt-3 text-[13px] font-semibold uppercase tracking-[1.5px] text-ink-400">
          Last updated {updated}
        </p>
        {intro && <p className="mt-6 text-[16px] leading-relaxed text-ink-500">{intro}</p>}

        <div className="mt-6 rounded-2xl border border-purple-600/15 bg-white/70 px-5 py-3.5 text-[13px] leading-relaxed text-ink-500">
          <strong className="text-ink-700">Template notice:</strong> this document is a
          starting point, not legal advice. Have it reviewed by qualified counsel and
          tailored to your jurisdiction before launch.
        </div>

        <div className="mt-10 text-[15px] leading-relaxed text-ink-500 [&_a]:font-semibold [&_a]:text-purple-600 [&_h2]:mb-3 [&_h2]:mt-11 [&_h2]:font-display [&_h2]:text-[26px] [&_h2]:font-semibold [&_h2]:text-ink-900 [&_li]:mb-1.5 [&_p]:mb-4 [&_strong]:text-ink-700 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </main>

      <footer className="flex flex-wrap items-center gap-5 border-t border-white/60 px-6 py-10 sm:px-14">
        <div className="flex items-center gap-2">
          <Image src="/logo.webp" alt="Dew" width={40} height={24} className="h-[24px] w-auto" />
          <span className="font-display text-[20px] font-semibold text-purple-700">Dew</span>
        </div>
        <div className="flex-1" />
        <Link href="/privacy" className="text-sm font-semibold text-ink-700 hover:text-purple-600">Privacy</Link>
        <Link href="/terms" className="text-sm font-semibold text-ink-700 hover:text-purple-600">Terms</Link>
        <a href={`${APP_URL}/sign-in`} className="text-sm font-semibold text-ink-700 hover:text-purple-600">Log in</a>
        <span className="text-[13px] text-ink-400">© 2026 Dew</span>
      </footer>
    </div>
  );
}
