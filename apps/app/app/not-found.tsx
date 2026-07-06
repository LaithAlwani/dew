import Image from "next/image";
import Link from "next/link";

// Dew 404 — faithful port of "Dew 404 Desktop.dc.html". Full-screen, no shell.
export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[linear-gradient(180deg,#F1EAFB_0%,#FBF9FE_52%,#F5EDF6_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[48%] size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[32px]"
        style={{ background: "radial-gradient(circle,rgba(205,170,238,.4),transparent 66%)" }}
      />

      <header className="relative z-10 flex items-center gap-2.5 px-6 py-7 sm:px-14">
        <Image src="/logo.webp" alt="Dew" width={52} height={30} className="h-[30px] w-auto" />
        <span className="font-display text-2xl font-semibold tracking-wide text-purple-700">Dew</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center sm:px-14">
        <Image
          src="/logo.webp"
          alt=""
          width={160}
          height={96}
          className="mb-3.5 h-[88px] w-auto drop-shadow-[0_16px_30px_rgba(140,90,200,0.3)] motion-safe:animate-[dwFloat_5.5s_ease-in-out_infinite]"
        />
        <div className="font-display text-[104px] font-medium leading-none tracking-[3px] text-purple-500 sm:text-[128px]">404</div>
        <h1 className="font-display mt-1.5 text-4xl font-medium leading-[1.05] text-ink-900 sm:text-[46px]">
          This page lost its glow.
        </h1>
        <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-ink-500">
          We couldn&apos;t find the page you were looking for. Let&apos;s get you back to something beautiful.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/home" className="bg-primary-gradient inline-flex h-14 items-center rounded-[28px] px-[30px] text-base font-bold text-white shadow-glow">
            Back to home
          </Link>
          <Link href="/experts" className="inline-flex h-14 items-center rounded-[28px] border border-purple-600/[0.16] bg-white/70 px-[26px] text-base font-semibold text-purple-600">
            Find an expert
          </Link>
        </div>
      </main>

      <style>{`@keyframes dwFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
    </div>
  );
}
