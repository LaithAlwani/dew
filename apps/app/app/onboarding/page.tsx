"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, BadgeCheck } from "lucide-react";

type Kind = "single" | "multi";
type Answers = {
  reason: string;
  experience: string;
  struggles: string[];
  skin: string;
  budget: string;
  makeup: string;
  age: boolean;
  terms: boolean;
};

const QS: { key: keyof Answers; kind: Kind; eyebrow: string; h: string; sub: string; opts: string[] }[] = [
  { key: "reason", kind: "single", eyebrow: "Getting started", h: "What brings you to Dew today?", sub: "This helps us find your first matches.", opts: ["Makeup help", "Skincare help", "Product shopping", "Shade matching", "Routine help", "Event glam"] },
  { key: "experience", kind: "single", eyebrow: "About you", h: "How would you describe your experience?", sub: "No wrong answer — we meet you where you are.", opts: ["Beginner", "Comfortable", "Advanced", "Just curious"] },
  { key: "struggles", kind: "multi", eyebrow: "The real stuff", h: "What are your biggest struggles?", sub: "Pick all that feel true.", opts: ["Products never look right", "Shade matching", "Breakouts", "Texture", "Dry skin", "Oily skin", "No routine", "Budget confusion"] },
  { key: "skin", kind: "single", eyebrow: "Your skin", h: "What's your skin type?", sub: "We use this to personalize everything.", opts: ["Dry", "Oily", "Combination", "Normal", "Sensitive", "Not sure"] },
  { key: "budget", kind: "single", eyebrow: "Your budget", h: "What's your beauty budget?", sub: "Dew respects whatever it is.", opts: ["Drugstore", "Mid-range", "High-end", "Mix of everything"] },
  { key: "makeup", kind: "single", eyebrow: "Your look", h: "What's your makeup goal?", sub: "Where you want to end up.", opts: ["Natural", "Soft glam", "Full glam", "Clean girl", "Professional", "Everyday easy"] },
];
const TOTAL = 7; // 6 questions + consent

const MATCHES = [
  { name: "Amara R.", tags: "Skincare · Acne", rating: "4.9", price: "from $25", reason: "Strong match for acne + budget" },
  { name: "Noor S.", tags: "Makeup · Soft glam", rating: "4.8", price: "free intro", reason: "Great for everyday natural looks" },
];

const EMPTY: Answers = { reason: "", experience: "", struggles: [], skin: "", budget: "", makeup: "", age: false, terms: false };

export default function ClientOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Answers>(EMPTY);
  const advRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isQuestion = step < 6;
  const isConsent = step === 6;
  const isResult = step === TOTAL;
  const go = (n: number) => setStep(Math.max(0, Math.min(TOTAL, n)));

  const selectSingle = (key: keyof Answers, label: string) => {
    setAns((a) => ({ ...a, [key]: label }));
    if (advRef.current) clearTimeout(advRef.current);
    advRef.current = setTimeout(() => setStep((s) => Math.min(TOTAL, s + 1)), 320);
  };
  const toggleMulti = (key: keyof Answers, label: string) => {
    setAns((a) => {
      const arr = a[key] as string[];
      return { ...a, [key]: arr.includes(label) ? arr.filter((x) => x !== label) : [...arr, label] };
    });
  };

  const q = isQuestion ? QS[step]! : null;
  const fillPct = ((step + 1) / (TOTAL + 1)) * 100;

  return (
    <div className="flex h-dvh bg-[#FBF9FE]">
      {/* LEFT brand panel */}
      <aside className="relative hidden w-[468px] flex-none flex-col overflow-hidden p-12 text-white min-[867px]:flex" style={{ background: "linear-gradient(160deg,#6D4AA0,#8657C8 60%,#A85EB8)" }}>
        <div className="pointer-events-none absolute -right-16 -top-16 size-[280px] rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,.18),transparent 70%)" }} />
        <div className="relative z-10 flex items-center gap-2.5">
          <Image src="/logo.webp" alt="Dew" width={60} height={32} className="h-8 w-auto brightness-0 invert" />
          <span className="font-display text-[26px] font-semibold tracking-wide">Dew</span>
        </div>
        <div className="relative z-10 mt-auto">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[2.5px] text-white/70">Let&apos;s personalize Dew</div>
          <h1 className="font-display text-[40px] font-medium leading-[1.12]">A few questions, and we&apos;ll find experts who truly fit you.</h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-white/85">No wrong answers — Dew meets you exactly where you are, on any budget.</p>
        </div>
        <div className="relative z-10 mt-9 flex items-center gap-2.5">
          <div className="h-[7px] flex-1 overflow-hidden rounded bg-white/25">
            <div className="h-full rounded bg-white transition-[width] duration-300" style={{ width: `${fillPct}%` }} />
          </div>
          <span className="min-w-[70px] text-right text-xs font-bold text-white/90">Step {Math.min(step + 1, TOTAL)} of {TOTAL}</span>
        </div>
      </aside>

      {/* RIGHT content */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-[88px] flex-none items-center px-6 sm:px-14">
          <button onClick={() => go(step - 1)} aria-label="Back" className="flex size-10 items-center justify-center rounded-full border border-purple-600/15 bg-white transition disabled:opacity-35" disabled={step === 0}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M8 1L1.5 8L8 15" stroke="#6D4AA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {/* mobile progress */}
          <div className="mx-4 h-1.5 flex-1 overflow-hidden rounded bg-lavender-200 min-[867px]:hidden">
            <div className="bg-primary-gradient h-full rounded transition-[width] duration-300" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="hidden flex-1 min-[867px]:block" />
          {isQuestion && (
            <button onClick={() => go(step + 1)} className="text-[13.5px] font-semibold text-ink-400">Skip</button>
          )}
        </div>

        {/* QUESTION */}
        {isQuestion && q && (
          <>
            <div className="min-h-0 w-full max-w-[720px] flex-1 overflow-y-auto px-6 pb-6 pt-2 sm:px-14">
              <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[2.5px] text-ink-400">{q.eyebrow}</div>
              <h2 className="font-display text-[34px] font-medium leading-[1.08] text-ink-900 sm:text-[38px]">{q.h}</h2>
              <p className="mb-7 mt-2 text-[14.5px] text-ink-500">{q.sub}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {q.opts.map((label) => {
                  const on = q.kind === "multi" ? (ans[q.key] as string[]).includes(label) : ans[q.key] === label;
                  return (
                    <button
                      key={label}
                      onClick={() => (q.kind === "multi" ? toggleMulti(q.key, label) : selectSingle(q.key, label))}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-[19px] py-[17px] text-left text-[15px] font-semibold text-ink-900 transition ${on ? "border-[1.5px] border-purple-500 bg-purple-500/[0.09]" : "border border-purple-600/10 bg-white"}`}
                    >
                      <span>{label}</span>
                      <span className={`flex size-[22px] flex-none items-center justify-center rounded-full ${on ? "bg-purple-500" : "border-[1.5px] border-purple-600/20"}`}>
                        {on && <Check className="size-3 text-white" strokeWidth={2.5} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-none items-center gap-[18px] px-6 pb-10 pt-4 sm:px-14">
              <button onClick={() => go(step + 1)} className="bg-primary-gradient h-[54px] rounded-[27px] px-10 text-[15.5px] font-bold text-white shadow-glow">
                {q.kind === "multi" ? "Save & continue" : "Continue"}
              </button>
              {q.kind === "multi" && <span className="text-[13px] text-ink-400">Pick all that apply</span>}
            </div>
          </>
        )}

        {/* CONSENT */}
        {isConsent && (
          <>
            <div className="min-h-0 w-full max-w-[640px] flex-1 overflow-y-auto px-6 pb-6 pt-2 sm:px-14">
              <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[2.5px] text-ink-400">Almost there</div>
              <h2 className="font-display text-[34px] font-medium leading-[1.08] text-ink-900 sm:text-[38px]">A few last things.</h2>
              <p className="mb-7 mt-2 text-[14.5px] text-ink-500">This keeps Dew safe and your matches accurate.</p>
              {([
                { key: "age" as const, title: "I'm 16 or older", sub: "Dew is currently available for users 16 and older." },
                { key: "terms" as const, title: "I agree to Dew's terms", sub: "Terms, Privacy, and use of my beauty profile for matching." },
              ]).map((c) => {
                const on = ans[c.key];
                return (
                  <button
                    key={c.key}
                    onClick={() => setAns((a) => ({ ...a, [c.key]: !a[c.key] }))}
                    className={`mb-3.5 flex w-full items-start gap-3.5 rounded-2xl p-[19px] text-left transition ${on ? "border-[1.5px] border-purple-500 bg-purple-500/[0.09]" : "border border-purple-600/10 bg-white"}`}
                  >
                    <span className={`mt-0.5 flex size-[26px] flex-none items-center justify-center rounded-lg ${on ? "bg-purple-500" : "border-[1.5px] border-purple-600/20"}`}>
                      {on && <Check className="size-3.5 text-white" strokeWidth={2.5} />}
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold text-ink-900">{c.title}</span>
                      <span className="mt-1 block text-[13px] leading-snug text-ink-500">{c.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex-none px-6 pb-10 pt-4 sm:px-14">
              <button
                onClick={() => ans.age && ans.terms && go(TOTAL)}
                className={`bg-primary-gradient h-[54px] rounded-[27px] px-10 text-[15.5px] font-bold text-white shadow-glow transition-opacity ${ans.age && ans.terms ? "" : "opacity-45"}`}
              >
                See my matches
              </button>
            </div>
          </>
        )}

        {/* RESULT */}
        {isResult && (
          <div className="relative min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-5 sm:px-14">
            <div className="pointer-events-none absolute left-1/2 top-5 size-[320px] -translate-x-1/2 rounded-full blur-2xl" style={{ background: "radial-gradient(circle,rgba(205,170,238,.35),transparent 66%)" }} />
            <div className="relative z-10 max-w-[620px]">
              <div className="mb-6 text-center">
                <div className="bg-primary-gradient mx-auto mb-4 flex size-[66px] items-center justify-center rounded-full shadow-glow">
                  <Check className="size-8 text-white" strokeWidth={2.2} />
                </div>
                <h2 className="font-display text-[36px] font-medium leading-[1.08] text-ink-900">Your Dew matches are ready.</h2>
                <p className="mx-auto mt-2 max-w-[420px] text-sm text-ink-500">Based on your goals, budget, and concerns, these experts may be a strong fit.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {MATCHES.map((e) => (
                  <div key={e.name} className="rounded-[22px] border border-purple-600/[0.08] bg-white p-[18px] shadow-[0_14px_30px_-12px_rgba(120,80,160,0.24)]">
                    <div className="flex items-center gap-3">
                      <div className="size-[52px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold text-ink-900">{e.name}</span>
                          <BadgeCheck className="size-[13px] text-purple-500" />
                        </div>
                        <div className="mt-0.5 text-[11px] text-ink-500">{e.tags}</div>
                        <div className="mt-1 flex items-center gap-1 text-[11px]">
                          <span className="text-warning">★</span>
                          <span className="font-bold text-ink-900">{e.rating}</span>
                          <span className="text-ink-400">· {e.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-[11px] rounded-xl bg-purple-500/[0.09] px-3 py-2.5 text-[11.5px] font-semibold text-purple-600">{e.reason}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3.5">
                <button onClick={() => router.push("/home")} className="bg-primary-gradient h-[52px] rounded-[26px] px-8 text-[15px] font-bold text-white shadow-glow">View my matches</button>
                <button onClick={() => { setAns(EMPTY); go(0); }} className="text-[13.5px] font-semibold text-ink-400">Restart questionnaire</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
