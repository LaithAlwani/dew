import type { Metadata } from "next";
import { GlassCard } from "@dew/ui";

export const metadata: Metadata = {
  title: "How Dew works",
  description:
    "We help you understand why something fits you — not just what is trending.",
};

const steps = [
  {
    t: "Tell Dew about your goals",
    d: "Your concerns, budget, routine and experience — in a few quick taps.",
  },
  {
    t: "Get matched with curated beauty experts",
    d: "1–3 vetted experts chosen for you, with a clear reason why.",
  },
  {
    t: "Learn what actually works for you",
    d: "Guidance that evolves as Dew learns your preferences.",
  },
];

export default function Tour() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="text-4xl leading-tight">How Dew works</h1>
      <p className="mt-3 text-sm text-ink-500">Guidance over overwhelm.</p>
      <div className="mt-8 space-y-4">
        {steps.map((s, i) => (
          <GlassCard key={s.t} className="flex gap-4">
            <span className="bg-primary-gradient flex size-9 shrink-0 items-center justify-center rounded-full font-medium text-white shadow-glow">
              {i + 1}
            </span>
            <div>
              <h3 className="text-lg">{s.t}</h3>
              <p className="mt-1 text-sm text-ink-500">{s.d}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
