"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AuthChooser } from "@dew/ui";

/**
 * Dew "Get started" story (marketing) — faithful port of the imported design "Dew Onboarding.dc.html".
 * A 6-screen swipeable story (Hero → Chaos → Mismatch → Clarity → How it works →
 * Final CTA) ending in a sign-up sheet that routes into Clerk.
 */

const N = 6;
const PRIMARY = "linear-gradient(135deg,#6D4AA0,#8657C8)";
const BTN_SHADOW =
  "0 14px 28px rgba(109,74,160,.36),inset 0 1px 0 rgba(255,255,255,.28)";

type ChaosCard = {
  top: number;
  left?: number;
  right?: number;
  anim: string;
  opacity?: number;
  text: string;
  swatch?: string;
  strong?: boolean;
};

const CHAOS: ChaosCard[] = [
  { top: 104, left: 22, anim: "dwFloatA 6.5s", text: "Retinol — yes or no?", swatch: "repeating-linear-gradient(135deg,#E7DCF3,#E7DCF3 4px,#DBCCEC 4px,#DBCCEC 8px)", strong: true },
  { top: 118, right: 20, anim: "dwFloatB 7.8s", text: "14 tabs open", strong: true },
  { top: 176, left: 44, anim: "dwFloatC 8.4s", opacity: 0.9, text: "Trending on TikTok" },
  { top: 196, right: 34, anim: "dwFloatD 6.9s", text: "$48 serum", swatch: "repeating-linear-gradient(135deg,#F1DCEA,#F1DCEA 4px,#E7CCE0 4px,#E7CCE0 8px)", strong: true },
  { top: 258, left: 26, anim: "dwFloatB 7.2s", opacity: 0.85, text: "Is this my shade?" },
  { top: 270, right: 28, anim: "dwFloatA 8.1s", text: "Dupe or original?", swatch: "repeating-linear-gradient(135deg,#DDD5F0,#DDD5F0 4px,#CFC4E8 4px,#CFC4E8 8px)", strong: true },
  { top: 340, left: 70, anim: "dwFloatC 6.6s", opacity: 0.8, text: "Do I even need this?" },
];

const MISMATCH: { top: number; left?: number; right?: number; anim: string; opacity?: number; dot: string; text: string }[] = [
  { top: 112, left: 24, anim: "dwFloatC 7.4s", opacity: 0.9, dot: "#D8A57E", text: "Too warm" },
  { top: 150, right: 22, anim: "dwFloatA 8.2s", dot: "#C99BB0", text: "Wrong undertone" },
  { top: 214, left: 40, anim: "dwFloatD 6.8s", opacity: 0.85, dot: "#B7A6D8", text: "Made for oily skin" },
  { top: 250, right: 36, anim: "dwFloatB 7.6s", dot: "#E0B48C", text: "Over budget" },
  { top: 318, left: 58, anim: "dwFloatC 8.6s", opacity: 0.75, dot: "#CBB6A0", text: "Not your texture" },
];

const STEPS = [
  { n: 1, title: "Tell Dew about your goals", body: "Your concerns, budget, skin, and routine.", grad: "linear-gradient(135deg,#EADBF7,#F3E2EF)" },
  { n: 2, title: "Get matched with curated experts", body: "Vetted humans, hand-picked for you.", grad: "linear-gradient(135deg,#E4DAF7,#EFDDF0)" },
  { n: 3, title: "Learn what actually works for you", body: "Guidance that evolves as you do.", grad: "linear-gradient(135deg,#EDDBF3,#F3DEE9)" },
];

// Desktop two-panel steps (design "Dew Onboarding Desktop.dc.html").
const DESKTOP_STEPS = [
  { eyebrow: "Curated beauty guidance", h: "Your beauty routine should feel personalized. Not random.", b: "Dew matches you with vetted beauty experts around your real goals, concerns, and budget — so you can stop chasing and start choosing.", cta: "Start your Dew journey", portrait: true, float: false, panel: "linear-gradient(160deg,#8367BE,#A85EB8 60%,#C77BB0)" },
  { eyebrow: "Sound familiar?", h: "You research. You compare. And still don't feel sure.", b: "Endless tabs, trending products, conflicting advice — beauty has never had more noise, or less clarity about what actually works for you.", cta: "Continue", portrait: false, float: true, panel: "linear-gradient(160deg,#6D4AA0,#8657C8 62%,#A85EB8)" },
  { eyebrow: "The real problem", h: "Most advice wasn't made for you.", b: "Not your face, your goals, your budget, or your actual routine. Generic tips can only get you so far — real fit is personal.", cta: "Continue", portrait: false, float: true, panel: "linear-gradient(160deg,#5E4494,#7C51BE 62%,#9E5CB4)" },
  { eyebrow: "Clarity", h: "Say goodbye to the guesswork — we've got you covered.", b: "Dew resolves the noise into a single, curated expert match who understands your skin and tells you exactly why they fit.", cta: "See how Dew works", portrait: true, float: false, panel: "linear-gradient(160deg,#7B57B8,#9A63C4 60%,#C77BB0)" },
  { eyebrow: "How Dew works", h: "We help you understand why something fits you.", b: "Tell Dew your goals, get matched with curated experts, and learn what actually works — guidance that evolves as you do.", cta: "Continue", portrait: false, float: true, panel: "linear-gradient(160deg,#6D4AA0,#8657C8 62%,#B268B0)" },
  { eyebrow: "Ready when you are", h: "You need guidance that actually fits you.", b: "Trusted experts, matched to your real routine — with smart tools that make it all feel easy. Let's make beauty feel personal again.", cta: "Get started", portrait: true, float: false, panel: "linear-gradient(160deg,#8367BE,#A85EB8 58%,#D083BE)" },
];

function PrimaryButton({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: 54,
        border: "none",
        borderRadius: 30,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 15.5,
        fontWeight: 600,
        letterSpacing: ".3px",
        color: "#fff",
        background: PRIMARY,
        boxShadow: BTN_SHADOW,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  color: "#9179B5",
};
const heading = (size: number): React.CSSProperties => ({
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.1,
  color: "#2E2440",
  margin: 0,
});
const em: React.CSSProperties = { fontStyle: "italic", color: "#7B52C4" };

// Sign-up body shared by the mobile drawer and the desktop inline right panel.
// The sheet itself is the shared <AuthChooser> (single source of truth also used
// as the app's sign-up landing). Here every action redirects into apps/app.
function SignupContent({
  route,
  setRoute,
  gotoEmail,
  gotoSSO,
  goLogin,
}: {
  route: "client" | "expert";
  setRoute: (r: "client" | "expert") => void;
  gotoEmail: () => void;
  gotoSSO: (provider: "google" | "apple") => void;
  goLogin: () => void;
}) {
  return (
    <AuthChooser
      role={route}
      onRole={setRoute}
      onApple={() => gotoSSO("apple")}
      onGoogle={() => gotoSSO("google")}
      onEmail={gotoEmail}
      onFooter={goLogin}
    />
  );
}

export default function Welcome() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://app.localhost:3000";
  const [screen, setScreen] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [route, setRoute] = useState<"client" | "expert">("client");
  const pxRef = useRef<number | null>(null);

  const go = useCallback(
    (n: number) => setScreen(Math.max(0, Math.min(N - 1, n))),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showSignup) return;
      if (e.key === "ArrowRight") go(screen + 1);
      else if (e.key === "ArrowLeft") go(screen - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, showSignup, go]);

  const onDown = (e: React.PointerEvent) => {
    pxRef.current = e.clientX;
  };
  const onUp = (e: React.PointerEvent) => {
    if (pxRef.current == null) return;
    const d = e.clientX - pxRef.current;
    if (d < -45) go(screen + 1);
    else if (d > 45) go(screen - 1);
    pxRef.current = null;
  };

  const openSignup = (r: "client" | "expert") => {
    setRoute(r);
    setShowSignup(true);
  };
  // Email button lands in the app with the email/password form already open.
  const gotoEmail = () => { window.location.href = `${APP_URL}/sign-up?role=${route}&method=email`; };
  // SSO buttons hand off to apps/app, which fires the Clerk OAuth redirect on load.
  const gotoSSO = (provider: "google" | "apple") => { window.location.href = `${APP_URL}/sign-up?role=${route}&sso=${provider}`; };
  const goLogin = () => { window.location.href = `${APP_URL}/sign-in`; };

  const active = screen - 1;
  const ds = DESKTOP_STEPS[screen]!;
  const desktopPrimary = () =>
    screen >= N - 1 ? openSignup("client") : go(screen + 1);

  return (
    <div className="relative min-h-dvh" style={{ fontFamily: "var(--font-sans)", background: "#F1EAFB" }}>
      <style>{`
        @keyframes dwFloatA{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-12px) rotate(-4deg)}}
        @keyframes dwFloatB{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(11px) rotate(3deg)}}
        @keyframes dwFloatC{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-8px) rotate(-1.5deg)}}
        @keyframes dwFloatD{0%,100%{transform:translateY(0) rotate(5deg)}50%{transform:translateY(9px) rotate(5deg)}}
        @keyframes dwGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.82;transform:scale(1.08)}}
        @keyframes dwGlowM{0%,100%{opacity:.5;transform:translateX(-50%) scale(1)}50%{opacity:.8;transform:translateX(-50%) scale(1.08)}}
        @keyframes dwSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes dwFade{from{opacity:0}to{opacity:1}}
        @keyframes dwFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .dw-fade{animation:dwFadeUp .5s ease both}
        .dw-slide{scrollbar-width:none;-ms-overflow-style:none}
        .dw-slide::-webkit-scrollbar{display:none;width:0;height:0}
        @media (prefers-reduced-motion: reduce){*{animation:none !important}}
      `}</style>

      {/* ═══════════ DESKTOP (lg+) — two-panel ═══════════ */}
      <div className="hidden min-h-dvh min-[867px]:flex">
        {/* LEFT visual panel — full-bleed photo + per-step color tint */}
        <div className="relative w-[44%] max-w-[620px] flex-none overflow-hidden bg-[url('/makeup.jpg')] bg-cover bg-center">
          <div className="pointer-events-none absolute inset-0" style={{ background: ds.panel, opacity: 0.5, transition: "background .5s ease" }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(30,20,45,.12),rgba(30,20,45,.5))" }} />
          <div className="pointer-events-none absolute -left-16 -top-20 size-[320px] rounded-full blur-2xl" style={{ background: "radial-gradient(circle,rgba(158,120,224,.5),transparent 68%)", animation: "dwGlow 9s ease-in-out infinite" }} />
          <div className="pointer-events-none absolute -bottom-16 -right-10 size-[340px] rounded-full blur-2xl" style={{ background: "radial-gradient(circle,rgba(226,140,200,.42),transparent 68%)", animation: "dwGlow 11s ease-in-out infinite 1s" }} />
          <div className="absolute left-[52px] top-12 z-[5] flex items-center gap-2.5">
            <Image src="/logo.webp" alt="Dew" width={56} height={32} className="h-8 w-auto brightness-0 invert" />
            <span className="font-display text-[26px] font-semibold tracking-wide text-white">Dew</span>
          </div>

          {ds.float && (
            <>
              <div className="absolute left-[70px] top-[220px] z-[4]" style={{ animation: "dwFloatA 6.5s ease-in-out infinite" }}>
                <div className="flex items-center gap-2.5 rounded-[18px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_14px_30px_-8px_rgba(80,50,120,0.35)] backdrop-blur-md">
                  <span className="text-base text-warning">★</span>
                  <div><div className="text-[15px] font-bold leading-none text-ink-900">4.9</div><div className="mt-0.5 text-[10px] text-ink-500">320 reviews</div></div>
                </div>
              </div>
              <div className="absolute right-[80px] top-[330px] z-[4] w-[186px]" style={{ animation: "dwFloatB 7.5s ease-in-out infinite" }}>
                <div className="rounded-[20px] border border-white/80 bg-white/70 p-3.5 shadow-[0_16px_32px_-8px_rgba(80,50,120,0.35)] backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="size-11 flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
                    <div><div className="text-sm font-bold leading-tight text-ink-900">Amara R.</div><div className="mt-0.5 text-[10px] text-ink-500">Skincare · Acne</div></div>
                  </div>
                  <div className="mt-2.5 rounded-[10px] bg-purple-500/10 px-2 py-1.5 text-center text-[11px] font-semibold text-purple-500">Strong match for you</div>
                </div>
              </div>
              <div className="absolute bottom-[150px] left-[110px] z-[4]" style={{ animation: "dwFloatC 5.8s ease-in-out infinite" }}>
                <div className="flex items-center gap-2.5 rounded-[18px] border border-white/80 bg-white/70 px-[15px] py-[11px] shadow-[0_14px_30px_-8px_rgba(80,50,120,0.3)] backdrop-blur-md">
                  <span className="size-2 rounded-full bg-[#5FB98C]" />
                  <span className="text-xs font-bold text-ink-900">Fits your routine &amp; budget</span>
                </div>
              </div>
            </>
          )}

          <div className="absolute inset-x-[52px] bottom-12 z-[5] flex items-center gap-2">
            {DESKTOP_STEPS.map((_, d) => (
              <span key={d} className="h-[7px] rounded transition-all duration-300" style={{ width: d === screen ? 20 : 7, background: d === screen ? "#fff" : "rgba(255,255,255,.4)" }} />
            ))}
          </div>
        </div>

        {/* RIGHT content — onboarding step, or the sign-up form inline */}
        <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-y-auto px-16 py-12">
          {/* Back button — same look + position on every screen, incl. the sign-up sheet */}
          {(showSignup || screen > 0) && (
            <button
              onClick={() => (showSignup ? setShowSignup(false) : go(screen - 1))}
              aria-label="Back"
              className="absolute left-16 top-11 z-10 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-400 transition hover:text-ink-700"
            >
              <svg width="7" height="12" viewBox="0 0 9 16" fill="none"><path d="M8 1L1.5 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
          )}
          {showSignup ? (
            <div key="signup" className="dw-fade mx-auto w-full max-w-[400px]">
              <SignupContent route={route} setRoute={setRoute} gotoEmail={gotoEmail} gotoSSO={gotoSSO} goLogin={goLogin} />
            </div>
          ) : (
            <>
              {screen < N - 1 && (
                <button onClick={() => go(N - 1)} className="absolute right-16 top-11 text-[13.5px] font-semibold text-ink-400 transition hover:text-ink-700">Skip intro</button>
              )}
              <div key={screen} className="dw-fade max-w-[520px]">
                <div className="mb-[18px] text-xs font-semibold uppercase tracking-[2.5px] text-ink-400">{ds.eyebrow}</div>
                <h1 className="font-display text-[52px] font-medium leading-[1.05] text-ink-900">{ds.h}</h1>
                <p className="mt-5 text-[16.5px] leading-relaxed text-ink-500">{ds.b}</p>
              </div>
              {/* Primary CTA — fixed size, pinned to the bottom-right on every screen */}
              <div className="absolute bottom-12 right-16 flex items-center gap-4">
                {(screen === 0 || screen === N - 1) && (
                  <button onClick={() => openSignup("expert")} className="h-14 rounded-[28px] border border-purple-600/[0.16] bg-white/70 px-6 text-[15px] font-semibold text-purple-600">Join as an expert</button>
                )}
                <button onClick={desktopPrimary} className="bg-primary-gradient h-14 w-[240px] rounded-[28px] text-base font-bold text-white shadow-glow">{ds.cta}</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════ MOBILE (below lg) — carousel ═══════════ */}
      <div
        onPointerDown={onDown}
        onPointerUp={onUp}
        className="min-[867px]:hidden"
        style={{ position: "relative", width: "100%", maxWidth: 440, height: "100dvh", margin: "0 auto", overflow: "hidden" }}
      >

      {/* ── Top bar (screens 1–5) ── */}
      {screen >= 1 && (
        <div
          style={{
            position: "absolute",
            top: 46,
            left: 0,
            right: 0,
            zIndex: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 22px",
          }}
        >
          <button
            onClick={() => go(screen - 1)}
            aria-label="Back"
            style={{
              width: 38,
              height: 38,
              flex: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: "50%",
              background: "rgba(255,255,255,.7)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgba(90,60,130,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1.5 8L8 15" stroke="#6D4AA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  width: i === active ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === active ? "#7B52C4" : "rgba(123,82,196,.28)",
                  transition: "all .35s ease",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
          <div style={{ width: 38, display: "flex", justifyContent: "flex-end" }}>
            {screen >= 1 && screen < 5 && (
              <button
                onClick={() => go(5)}
                style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#9179B5" }}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Track ── */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          transform: `translateX(-${screen * 100}%)`,
          transition: "transform .46s cubic-bezier(.2,.8,.3,1)",
        }}
      >
        {/* SCREEN 0 · HERO */}
        <section className="dw-slide" style={{ flex: "0 0 100%", height: "100%", boxSizing: "border-box", position: "relative", overflowY: "auto", overflowX: "hidden", background: "url(/makeup.jpg) center/cover", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 30px 44px" }}>
          {/* colored gradient tint kept over the photo */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#F1EAFB 0%,#FBF9FE 50%,#F6EEF6 100%)", opacity: 0.55 }} />
          <div style={{ position: "absolute", top: -50, right: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(197,164,232,.55),transparent 70%)", filter: "blur(8px)" }} />
          <div style={{ position: "absolute", bottom: 140, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(224,155,203,.42),transparent 70%)", filter: "blur(8px)" }} />
          {/* strong bottom wash so the headline + buttons stand out clearly */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 18%, rgba(251,249,254,0.75) 44%, rgba(251,249,254,0.98) 74%)" }} />
          <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 2 }}>
            <Image src="/logo.webp" alt="Dew" width={140} height={64} priority style={{ height: 58, width: "auto" }} />
          </div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22, textShadow: "0 1px 14px rgba(251,249,254,0.95), 0 1px 3px rgba(251,249,254,0.8)" }}>
              <div style={eyebrow}>Curated beauty guidance</div>
              <h1 style={{ ...heading(38), lineHeight: 1.06, letterSpacing: ".2px" }}>
                Your beauty routine should feel <em style={em}>personalized.</em> Not random.
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "#6B5F7D", margin: 0 }}>
                Dew matches you with vetted beauty experts around your real goals, concerns, and budget — so you can stop chasing and start choosing.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
              <PrimaryButton onClick={() => go(1)}>Start Your Dew Journey</PrimaryButton>
              <button onClick={() => openSignup("expert")} style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "#7B52C4" }}>
                Join as an Expert →
              </button>
            </div>
          </div>
        </section>

        {/* SCREEN 1 · CHAOS */}
        <section className="dw-slide" style={{ flex: "0 0 100%", height: "100%", boxSizing: "border-box", position: "relative", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg,#EAE4F2 0%,#ECE6F1 46%,#EEE6EC 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "112px 30px 48px" }}>
          {CHAOS.map((c, i) => (
            <div key={i} style={{ position: "absolute", top: c.top, left: c.left, right: c.right, animation: `${c.anim} ease-in-out infinite`, opacity: c.opacity ?? 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: c.strong ? "8px 12px" : "7px 11px", borderRadius: 14, background: `rgba(255,255,255,${c.strong ? 0.72 : 0.6})`, backdropFilter: "blur(7px)", border: "1px solid rgba(255,255,255,.78)", boxShadow: "0 10px 22px rgba(120,90,150,.13)" }}>
                {c.swatch && <div style={{ width: 25, height: 25, borderRadius: 6, background: c.swatch }} />}
                <span style={{ fontSize: 11.5, fontWeight: 600, color: c.opacity && c.opacity < 0.9 ? "#7A6E90" : "#5A4E70" }}>{c.text}</span>
              </div>
            </div>
          ))}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ ...eyebrow, marginBottom: 14 }}>Sound familiar?</div>
            <h2 style={{ ...heading(34), lineHeight: 1.12, marginBottom: 26 }}>
              You research. You compare. You spend money.<br />
              <em style={em}>And somehow — you still don&apos;t feel sure.</em>
            </h2>
            <PrimaryButton onClick={() => go(2)}>Continue</PrimaryButton>
          </div>
        </section>

        {/* SCREEN 2 · MISMATCH */}
        <section className="dw-slide" style={{ flex: "0 0 100%", height: "100%", boxSizing: "border-box", position: "relative", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg,#E7E3F3 0%,#EBE5F1 48%,#EEE7EF 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "112px 30px 48px" }}>
          {MISMATCH.map((c, i) => (
            <div key={i} style={{ position: "absolute", top: c.top, left: c.left, right: c.right, animation: `${c.anim} ease-in-out infinite`, opacity: c.opacity ?? 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 20, background: "rgba(255,255,255,.68)", border: "1px solid rgba(255,255,255,.78)", boxShadow: "0 10px 20px rgba(120,90,150,.12)" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: c.dot }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#8A7080" }}>{c.text}</span>
              </div>
            </div>
          ))}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ ...eyebrow, marginBottom: 14 }}>The real problem</div>
            <h2 style={{ ...heading(33), lineHeight: 1.14, marginBottom: 26 }}>
              Most beauty advice wasn&apos;t made for <em style={em}>your</em> face, your goals, your budget, or your actual routine.
            </h2>
            <PrimaryButton onClick={() => go(3)}>Continue</PrimaryButton>
          </div>
        </section>

        {/* SCREEN 3 · CLARITY */}
        <section className="dw-slide" style={{ flex: "0 0 100%", height: "100%", boxSizing: "border-box", position: "relative", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg,#F5F0FC 0%,#FCFAFE 52%,#F7F1F9 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "104px 30px 48px" }}>
          <div style={{ position: "absolute", top: 120, left: "50%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(210,180,240,.4),transparent 68%)", filter: "blur(24px)", animation: "dwGlowM 7s ease-in-out infinite" }} />
          <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 250 }}>
              <div style={{ position: "absolute", top: -16, left: 14, right: 14, height: 70, borderRadius: 22, background: "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.6)", transform: "rotate(-4deg)", boxShadow: "0 8px 20px rgba(120,90,150,.08)" }} />
              <div style={{ position: "absolute", top: -9, left: 22, right: 6, height: 70, borderRadius: 22, background: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.7)", transform: "rotate(3deg)", boxShadow: "0 8px 20px rgba(120,90,150,.1)" }} />
              <div style={{ position: "relative", padding: 20, borderRadius: 24, background: "rgba(255,255,255,.94)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 22px 44px rgba(120,80,160,.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 56, height: 56, flex: "none", borderRadius: "50%", background: "url(/makeup.jpg) center/cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#2E2440" }}>Amara R.</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#7B52C4" /><path d="M4 7l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#8A7DA0", marginTop: 2 }}>Skincare · Acne · Beginner-friendly</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: "#E0A93E" }}>★</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2E2440" }}>4.9</span>
                      <span style={{ fontSize: 11, color: "#A99CBC" }}>· 320 reviews</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 13, background: "rgba(123,82,196,.09)", fontSize: 12, fontWeight: 600, color: "#6D4AA0", lineHeight: 1.35 }}>
                  Why we matched you: strong fit for acne concerns on a mid-range budget.
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ ...eyebrow, marginBottom: 12 }}>Clarity</div>
            <h2 style={{ ...heading(34), marginBottom: 24 }}>
              Say goodbye to those problems — <em style={em}>we&apos;ve got you covered.</em>
            </h2>
            <PrimaryButton onClick={() => go(4)}>See How Dew Works</PrimaryButton>
          </div>
        </section>

        {/* SCREEN 4 · HOW IT WORKS */}
        <section className="dw-slide" style={{ flex: "0 0 100%", height: "100%", boxSizing: "border-box", position: "relative", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg,#F3EDFB 0%,#FBF9FE 60%,#F6EEF6 100%)", display: "flex", flexDirection: "column", padding: "110px 30px 48px" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ ...eyebrow, marginBottom: 12 }}>How Dew works</div>
            <h2 style={{ ...heading(32), lineHeight: 1.12 }}>
              We help you understand why something fits <em style={em}>you</em> — not just what&apos;s trending.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ position: "relative", padding: "18px 20px", borderRadius: 20, background: "rgba(255,255,255,.72)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.85)", boxShadow: "0 10px 26px rgba(120,80,160,.1)" }}>
                <div style={{ position: "absolute", top: 10, right: 18, fontFamily: "var(--font-display)", fontSize: 46, fontWeight: 600, lineHeight: 1, color: "#7B52C4" }}>{s.n}</div>
                <div style={{ paddingRight: 44 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2E2440" }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: "#7A6E90", marginTop: 3, lineHeight: 1.4 }}>{s.body}</div>
                </div>
              </div>
            ))}
          </div>
          <PrimaryButton onClick={() => go(5)} style={{ marginTop: 16 }}>Continue</PrimaryButton>
        </section>

        {/* SCREEN 5 · FINAL CTA */}
        <section className="dw-slide" style={{ flex: "0 0 100%", height: "100%", boxSizing: "border-box", position: "relative", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg,#F1EAFB 0%,#FBF9FE 52%,#F5EDF6 100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "96px 32px 48px", textAlign: "center" }}>
          <div style={{ position: "absolute", top: 150, left: "50%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(205,170,238,.4),transparent 66%)", filter: "blur(26px)", animation: "dwGlowM 8s ease-in-out infinite" }} />
          <Image src="/logo.webp" alt="Dew" width={150} height={76} style={{ height: 76, width: "auto", position: "relative", zIndex: 2, marginBottom: 26, filter: "drop-shadow(0 12px 26px rgba(140,90,200,.32))" }} />
          <h2 style={{ ...heading(36), marginBottom: 16, position: "relative", zIndex: 2 }}>
            You don&apos;t need more beauty advice. You need <em style={em}>guidance that actually fits you.</em>
          </h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#6B5F7D", margin: "0 0 32px", position: "relative", zIndex: 2, maxWidth: 300 }}>
            Trusted experts, matched to your real routine — with smart tools that make it all feel easy.
          </p>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", position: "relative", zIndex: 2 }}>
            <PrimaryButton onClick={() => openSignup("client")}>Get Started</PrimaryButton>
            <div style={{ fontSize: 11, color: "#9179B5", marginTop: 6 }}>Help shape the future of personalized beauty guidance</div>
            <button onClick={() => openSignup("expert")} style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "#7B52C4" }}>Join as an Expert →</button>
          </div>
        </section>
      </div>

      </div>

      {/* ── Sign-up: bottom drawer (mobile only; desktop uses the inline right panel) ── */}
      {showSignup && (
        <div className="min-[867px]:hidden">
          <div onClick={() => setShowSignup(false)} className="fixed inset-0 z-[60] backdrop-blur-[2px]" style={{ background: "rgba(46,36,64,.34)", animation: "dwFade .3s ease" }} />
          <div
            className="fixed bottom-0 left-1/2 z-[61] w-full max-w-[460px] -translate-x-1/2 rounded-t-[34px] px-7 pb-10 pt-3.5 shadow-[0_-18px_50px_rgba(90,60,130,0.24)]"
            style={{ background: "linear-gradient(180deg,#FDFBFF,#F7F1FA)", animation: "dwSheetUp .42s cubic-bezier(.2,.8,.3,1)" }}
          >
            <div className="mx-auto mb-[18px] h-[5px] w-[42px] rounded-full bg-[rgba(123,82,196,0.22)]" />
            <SignupContent route={route} setRoute={setRoute} gotoEmail={gotoEmail} gotoSSO={gotoSSO} goLogin={goLogin} />
          </div>
        </div>
      )}
    </div>
  );
}
