"use client";

import { type DiscoveryAnswers, isDiscoveryComplete } from "@dew/validation";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";

const CHOICES = {
  category: [
    ["makeup", "Makeup"],
    ["skincare", "Skincare"],
    ["lesson", "A lesson"],
  ],
  occasion: [
    ["bridal", "Bridal"],
    ["event", "Event"],
    ["everyday", "Everyday"],
    ["editorial", "Editorial"],
  ],
  timing: [
    ["within_2_weeks", "Within 2 weeks"],
    ["this_month", "This month"],
    ["flexible", "I'm flexible"],
  ],
  budget: [
    ["under_100", "Under $100"],
    ["100_250", "$100–250"],
    ["250_500", "$250–500"],
    ["500_plus", "$500+"],
    ["unsure", "Not sure yet"],
  ],
} as const;

const SAFETY = [
  ["sensitive_skin", "Sensitive skin"],
  ["allergies", "Allergies"],
  ["pregnancy", "Pregnancy"],
  ["none", "None of these"],
] as const;

const STORAGE_KEY = "dew_anon_id";

export function Discovery() {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<DiscoveryAnswers>({});
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const save = useMutation(api.discovery.saveAnswers);
  const session = useQuery(api.discovery.getSession, anonymousId ? { anonymousId } : "skip");

  // Stable anonymous id in localStorage.
  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setAnonymousId(id);
  }, []);

  // Resume a saved session once.
  useEffect(() => {
    if (!hydrated && session !== undefined) {
      if (session?.answers) {
        setAnswers(session.answers as DiscoveryAnswers);
      }
      setHydrated(true);
    }
  }, [hydrated, session]);

  const stepKeys = useMemo(() => {
    const keys: string[] = ["category"];
    if (answers.category === "makeup") {
      keys.push("occasion");
    }
    keys.push("timing", "budget", "city", "safety", "summary");
    return keys;
  }, [answers.category]);

  if (!anonymousId || !hydrated) {
    return <p className="font-body text-navy/60">Loading…</p>;
  }

  const currentKey = stepKeys[Math.min(step, stepKeys.length - 1)];

  function persist(patch: Partial<DiscoveryAnswers>) {
    if (anonymousId) {
      save({ anonymousId, answers: patch });
    }
  }

  function choose(field: keyof DiscoveryAnswers, value: string) {
    setAnswers((a) => ({ ...a, [field]: value }));
    persist({ [field]: value } as Partial<DiscoveryAnswers>);
    setStep((s) => s + 1);
  }

  function toggleSafety(value: string) {
    setAnswers((a) => {
      const cur = a.safetyFlags ?? [];
      const next = cur.includes(value as never)
        ? cur.filter((s) => s !== value)
        : [...cur, value as never];
      return { ...a, safetyFlags: next };
    });
  }

  const progress = `Step ${Math.min(step + 1, stepKeys.length)} of ${stepKeys.length}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between font-body text-navy/60 text-sm">
        <span>{progress}</span>
        {step > 0 && currentKey !== "summary" && (
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            ← Back
          </button>
        )}
      </div>

      {currentKey === "category" && (
        <Question title="What are you looking for?">
          <Options
            choices={CHOICES.category}
            selected={answers.category}
            onPick={(v) => choose("category", v)}
          />
        </Question>
      )}

      {currentKey === "occasion" && (
        <Question title="What's the occasion?">
          <Options
            choices={CHOICES.occasion}
            selected={answers.occasion}
            onPick={(v) => choose("occasion", v)}
          />
        </Question>
      )}

      {currentKey === "timing" && (
        <Question title="When do you need it?">
          <Options
            choices={CHOICES.timing}
            selected={answers.timing}
            onPick={(v) => choose("timing", v)}
          />
        </Question>
      )}

      {currentKey === "budget" && (
        <Question title="What's your budget?">
          <Options
            choices={CHOICES.budget}
            selected={answers.budget}
            onPick={(v) => choose("budget", v)}
          />
        </Question>
      )}

      {currentKey === "city" && (
        <Question title="Which city?">
          <CityInput
            value={answers.city ?? ""}
            onChange={(v) => setAnswers((a) => ({ ...a, city: v }))}
            onNext={() => {
              persist({ city: answers.city });
              setStep((s) => s + 1);
            }}
          />
        </Question>
      )}

      {currentKey === "safety" && (
        <Question title="Anything we should know?">
          <div className="flex flex-wrap gap-2">
            {SAFETY.map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => toggleSafety(value)}
                className={`rounded-md px-3 py-2 font-body text-navy ${
                  (answers.safetyFlags ?? []).includes(value as never)
                    ? "bg-lavender"
                    : "border border-navy/15 bg-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              persist({ safetyFlags: answers.safetyFlags ?? [] });
              setStep((s) => s + 1);
            }}
            className="mt-4 self-start rounded-md bg-coral px-5 py-2 font-body text-surface"
          >
            Continue
          </button>
        </Question>
      )}

      {currentKey === "summary" && <Summary answers={answers} />}
    </div>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-3xl text-navy">{title}</h2>
      {children}
    </div>
  );
}

function Options({
  choices,
  selected,
  onPick,
}: {
  choices: readonly (readonly [string, string])[];
  selected?: string;
  onPick: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {choices.map(([value, label]) => (
        <button
          type="button"
          key={value}
          onClick={() => onPick(value)}
          className={`rounded-lg px-4 py-3 text-left font-body text-navy ${
            selected === value ? "bg-lavender" : "bg-surface shadow-soft hover:bg-lavender/40"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CityInput({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        className="rounded-md border border-navy/15 bg-surface px-3 py-2 font-body text-navy"
        placeholder="e.g. Toronto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        disabled={value.trim().length === 0}
        onClick={onNext}
        className="self-start rounded-md bg-coral px-5 py-2 font-body text-surface disabled:opacity-60"
      >
        Continue
      </button>
    </div>
  );
}

function Summary({ answers }: { answers: DiscoveryAnswers }) {
  const complete = isDiscoveryComplete(answers);
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-soft">
      <h2 className="font-display text-3xl text-navy">Here's what we heard</h2>
      <dl className="flex flex-col gap-1 font-body text-navy/80">
        {Object.entries(answers).map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="w-28 text-navy/50 capitalize">{k}</dt>
            <dd>{Array.isArray(v) ? v.join(", ") || "—" : String(v)}</dd>
          </div>
        ))}
      </dl>
      {complete ? (
        <div className="rounded-md bg-sage px-4 py-2 font-body text-navy text-sm">
          Great — we have what we need. Creating your account and matching you with professionals
          arrive in the next steps.
        </div>
      ) : (
        <div className="rounded-md bg-butter px-4 py-2 font-body text-navy text-sm">
          A few answers are still missing — step back to fill them in.
        </div>
      )}
    </div>
  );
}
