import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Coming soon" };


// Dew "Coming soon" — faithful port of "Dew Coming Soon Desktop.dc.html".
export default function ComingSoon() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[linear-gradient(180deg,#F1EAFB_0%,#FBF9FE_52%,#F5EDF6_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[30px]"
        style={{ background: "radial-gradient(circle,rgba(205,170,238,.4),transparent 66%)" }}
      />

      <header className="relative z-10 flex items-center gap-2.5 px-6 py-7 sm:px-14">
        <Image src="/logo.webp" alt="Dew" width={52} height={30} className="h-[30px] w-auto" />
        <span className="font-display text-2xl font-semibold tracking-wide text-purple-700">Dew</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center sm:px-14">
        <div className="bg-primary-gradient mb-9 flex size-28 items-center justify-center rounded-[38px] shadow-[0_24px_48px_-16px_rgba(109,74,160,0.5)] motion-safe:animate-[dwFloat_5s_ease-in-out_infinite]">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
        </div>
        <div className="mb-4 text-xs font-semibold uppercase tracking-[2.5px] text-ink-400">Product Scanner</div>
        <h1 className="font-display text-5xl font-medium leading-none text-ink-900 sm:text-[72px]">Coming soon.</h1>
        <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink-500">
          We&apos;re putting the finishing touches on Dew&apos;s smart tools. Soon you&apos;ll scan any product and instantly know if it fits your skin, goals, and budget.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/get-started" className="bg-primary-gradient inline-flex h-14 items-center rounded-[28px] px-[30px] text-base font-bold text-white shadow-glow">
            Notify me when it&apos;s live
          </Link>
          <Link href="/" className="inline-flex h-14 items-center rounded-[28px] border border-purple-600/[0.16] bg-white/70 px-[26px] text-base font-semibold text-purple-600">
            Back to home
          </Link>
        </div>
      </main>

      <style>{`@keyframes dwFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );
}
