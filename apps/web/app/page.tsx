import Image from "next/image";
import Link from "next/link";

// Marketing landing (domain.com) — faithful port of "Dew Landing Desktop".
// Static server component; apps/web only depends on @dew/ui (no lucide/auth).
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://app.localhost:3000";
const SLOT = "bg-[url('/makeup.jpg')] bg-cover bg-center";

function Verified() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="#7B52C4" />
      <path d="M4 7l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STORY = [
  { n: "01", t: "The chaos", d: "You research, compare, and spend — and still don't feel sure what's right for you.", dark: false },
  { n: "02", t: "The mismatch", d: "Most advice wasn't made for your face, your goals, your budget, or your routine.", dark: false },
  { n: "03", t: "The clarity", d: "Dew matches you with a vetted expert who gets you — and tells you why it fits.", dark: true },
];

const STEPS = [
  { n: 1, t: "Tell Dew your goals", d: "Your concerns, budget, skin, and routine — in a few tapped questions.", grad: "linear-gradient(135deg,#EADBF7,#F3E2EF)" },
  { n: 2, t: "Get matched with experts", d: "Vetted humans, hand-picked for you — with the reason they fit.", grad: "linear-gradient(135deg,#E4DAF7,#EFDDF0)" },
  { n: 3, t: "Learn what works for you", d: "Guidance that evolves as you do — booking, routines, and follow-ups.", grad: "linear-gradient(135deg,#EDDBF3,#F3DEE9)" },
];

const EXPERTS = [
  { name: "Amara R.", title: "Skincare · Acne", rating: "4.9", price: "from $25" },
  { name: "Noor S.", title: "Makeup · Soft glam", rating: "4.8", price: "free intro" },
  { name: "Lena V.", title: "Bridal Specialist", rating: "5.0", price: "from $60" },
  { name: "Priya M.", title: "Sensitive skin", rating: "4.9", price: "from $30" },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#F1EAFB_0%,#FBF9FE_620px,#F6EEF6_100%)]">
      {/* NAV */}
      <header className="sticky top-0 z-30 flex items-center gap-8 border-b border-white/60 bg-[rgba(247,242,252,0.72)] px-6 py-4 backdrop-blur-md sm:px-14">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.webp" alt="Dew" width={56} height={32} priority className="h-8 w-auto" />
          <span className="font-display text-[26px] font-semibold tracking-wide text-purple-700">Dew</span>
        </div>
        <nav className="ml-4 hidden items-center gap-7 lg:flex">
          {["How it works", "For experts", "Pricing", "Community"].map((l) => (
            <span key={l} className="cursor-pointer text-sm font-semibold text-ink-700 hover:text-purple-600">{l}</span>
          ))}
        </nav>
        <div className="flex-1" />
        <a href={`${APP_URL}/sign-in`} className="hidden text-sm font-semibold text-ink-700 hover:text-purple-600 sm:block">Log in</a>
        <Link href="/get-started" className="bg-primary-gradient inline-flex h-11 items-center rounded-[22px] px-[22px] text-sm font-bold text-white shadow-glow">Get started</Link>
      </header>

      {/* HERO */}
      <section className="relative grid grid-cols-1 items-center gap-12 overflow-hidden px-6 py-16 sm:px-14 lg:grid-cols-[1fr_500px] lg:gap-14 lg:py-20">
        <div className="pointer-events-none absolute -top-16 right-40 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(197,164,232,0.4),transparent_70%)] blur-lg" />
        <div className="relative z-10">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[2.5px] text-ink-400">Curated beauty guidance</div>
          <h1 className="font-display text-5xl font-medium leading-[1.02] text-ink-900 sm:text-[66px]">
            Your beauty routine should feel <em className="italic text-purple-500">personalized.</em> Not random.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-ink-500">
            Dew matches you with vetted beauty experts around your real goals, concerns, and budget — so you can stop chasing trends and start choosing what actually works for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/get-started" className="bg-primary-gradient inline-flex h-14 items-center rounded-[28px] px-[30px] text-base font-bold text-white shadow-glow">Start your Dew journey</Link>
            <a href={`${APP_URL}/sign-up?role=expert`} className="inline-flex h-14 items-center rounded-[28px] border border-purple-600/[0.16] bg-white/70 px-[26px] text-base font-semibold text-purple-600">Join as an expert</a>
          </div>
          <div className="mt-8 flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="text-warning">★</span>
              <span className="text-sm font-bold text-ink-900">4.9</span>
              <span className="text-[13px] text-ink-500">avg expert rating</span>
            </div>
            <div className="h-5 w-px bg-purple-600/15" />
            <div className="text-[13px] text-ink-500"><span className="font-bold text-ink-900">2,400+</span> experts vetted</div>
          </div>
        </div>
        <div className="relative z-10 flex justify-center">
          <div className="pointer-events-none absolute size-[420px] rounded-full bg-[radial-gradient(circle,rgba(217,139,196,0.3),transparent_68%)] blur-2xl" />
          <div className={`${SLOT} relative h-[400px] w-full max-w-[380px] rounded-[190px] shadow-[0_32px_64px_-20px_rgba(90,60,130,0.4)] lg:h-[470px]`} />
        </div>
      </section>

      {/* STORY STRIP */}
      <section className="px-6 pb-20 sm:px-14">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STORY.map((s) => (
            <div key={s.n} className={`rounded-[24px] border p-[30px] ${s.dark ? "bg-primary-gradient border-transparent" : "border-white/80 bg-white/70"}`}>
              <div className={`font-display text-[44px] leading-none ${s.dark ? "text-white/40" : "text-purple-500/30"}`}>{s.n}</div>
              <div className={`mt-2 text-[19px] font-bold ${s.dark ? "text-white" : "text-ink-900"}`}>{s.t}</div>
              <p className={`mt-2 text-sm leading-relaxed ${s.dark ? "text-white/90" : "text-ink-500"}`}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 pb-24 text-center sm:px-14">
        <div className="mb-3.5 text-xs font-semibold uppercase tracking-[2.5px] text-ink-400">How Dew works</div>
        <h2 className="font-display mx-auto mb-12 max-w-[680px] text-4xl font-medium leading-[1.08] text-ink-900 sm:text-[44px]">
          We help you understand why something fits <em className="italic text-purple-500">you</em> — not just what&apos;s trending.
        </h2>
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-[26px] border border-white/90 bg-white/80 p-8 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.16)]">
              <div className="font-display mb-5 flex size-14 items-center justify-center rounded-[18px] text-[28px] font-semibold text-purple-500" style={{ background: s.grad }}>{s.n}</div>
              <div className="mb-2 text-xl font-bold text-ink-900">{s.t}</div>
              <p className="text-[14.5px] leading-relaxed text-ink-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERT SHOWCASE */}
      <section className="px-6 pb-24 sm:px-14">
        <div className="mb-7 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-medium text-ink-900 sm:text-[38px]">Meet a few Dew experts</h2>
          <Link href="/get-started" className="text-[15px] font-semibold text-purple-500">Browse all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERTS.map((e) => (
            <div key={e.name} className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.2)]">
              <div className={`${SLOT} mb-4 h-[180px] w-full rounded-[18px]`} />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-ink-900">{e.name}</span>
                <Verified />
              </div>
              <div className="mt-0.5 text-xs text-ink-500">{e.title}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="text-warning">★</span>
                <span className="font-bold text-ink-900">{e.rating}</span>
                <span className="text-ink-400">· {e.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="px-6 pb-20 sm:px-14">
        <div className="bg-primary-gradient relative overflow-hidden rounded-[36px] p-12 text-center shadow-[0_28px_56px_-20px_rgba(109,74,160,0.4)] sm:p-16">
          <div className="pointer-events-none absolute -top-16 left-28 size-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-20 right-36 size-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,214,236,0.22),transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="font-display mx-auto mb-4 max-w-[640px] text-4xl font-medium leading-[1.08] text-white sm:text-[46px]">
              You don&apos;t need more beauty advice. You need guidance that fits you.
            </h2>
            <p className="mx-auto mb-8 max-w-[480px] text-base text-white/85">
              Trusted experts, matched to your real routine — with smart tools that make it feel easy.
            </p>
            <Link href="/get-started" className="inline-flex h-14 items-center rounded-[28px] bg-white px-[34px] text-base font-bold text-purple-600 shadow-[0_14px_28px_rgba(0,0,0,0.16)]">Get started free</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center gap-5 border-t border-white/60 px-6 py-11 sm:px-14">
        <div className="flex items-center gap-2">
          <Image src="/logo.webp" alt="Dew" width={44} height={26} className="h-[26px] w-auto" />
          <span className="font-display text-[22px] font-semibold text-purple-700">Dew</span>
        </div>
        <div className="flex-1" />
        {["Privacy", "Terms", "For experts", "Support"].map((l) => (
          <span key={l} className="cursor-pointer text-sm font-semibold text-ink-700 hover:text-purple-600">{l}</span>
        ))}
        <span className="text-[13px] text-ink-400">© 2026 Dew</span>
      </footer>
    </div>
  );
}
