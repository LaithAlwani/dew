import Link from "next/link";
import { Search, ScanLine, ListChecks, CircleDashed, BadgeCheck } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { auth, currentUser } from "@dew/auth/server";
import { api } from "@dew/backend/api";

export const dynamic = "force-dynamic";

const QUICK = [
  { label: "Find Expert", icon: Search, href: "/experts" },
  { label: "Scan Product", icon: ScanLine, href: "/scan" },
  { label: "My Routine", icon: ListChecks, href: "/routine" },
  { label: "Shade Match", icon: CircleDashed, href: "/shade-match" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function Home() {
  const user = await currentUser();
  const firstName = user?.firstName || "there";

  // Personalize matches from the client's saved onboarding, then fall back to
  // the top experts if there's nothing (or no match).
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  const profile = token
    ? await fetchQuery(api.onboarding.myProfile, {}, { token }).catch(() => null)
    : null;
  const term = profile
    ? [...profile.goals, ...profile.struggles, profile.skinType]
        .filter(Boolean)
        .join(" ")
    : "";

  let matches = (
    await fetchQuery(api.experts.list, {
      paginationOpts: { numItems: 4, cursor: null },
      search: term || undefined,
    })
  ).page;
  if (matches.length === 0) {
    matches = (
      await fetchQuery(api.experts.list, {
        paginationOpts: { numItems: 4, cursor: null },
      })
    ).page;
  }
  const top = matches[0];

  return (
    <div className="mx-auto w-full max-w-[1160px]">
      {/* greeting */}
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">
          {greeting()}
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">
          Hi, {firstName}
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_336px]">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          {/* next best step */}
          <div className="bg-primary-gradient relative overflow-hidden rounded-[28px] p-8 shadow-[0_22px_44px_-12px_rgba(109,74,160,0.4)]">
            <div className="pointer-events-none absolute -right-8 -top-10 size-[220px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
            <div className="relative z-10 max-w-[440px]">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-white/75">
                Your next best step
              </div>
              <div className="font-display mb-5 text-[32px] leading-[1.12] text-white">
                {top
                  ? `Book your first consult with ${top.name} — a top match for you.`
                  : "Tell us about your goals and meet your first expert match."}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={top ? `/booking?expert=${top._id}` : "/onboarding"}
                  className="flex h-[46px] items-center rounded-full bg-white px-6 text-sm font-bold text-purple-600"
                >
                  {top ? "Book a consult" : "Personalize Dew"}
                </Link>
                <Link
                  href="/experts"
                  className="flex h-[46px] items-center rounded-full border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white"
                >
                  Browse experts
                </Link>
              </div>
            </div>
          </div>

          {/* quick actions */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {QUICK.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="hover:shadow-float flex flex-col gap-3 rounded-[20px] border border-purple-600/[0.08] bg-white/75 p-5 text-left transition"
              >
                <Icon className="size-6 text-purple-500" strokeWidth={1.7} />
                <span className="text-[13px] font-semibold text-ink-700">{label}</span>
              </Link>
            ))}
          </div>

          {/* matched experts */}
          <div>
            <div className="mb-3.5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink-900">Best for you</h2>
              <Link href="/experts" className="text-[13px] font-semibold text-purple-500">See all</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {matches.map((e) => (
                <div key={e._id} className="rounded-[22px] border border-white/90 bg-white/85 p-[18px] shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
                  <div className="flex items-center gap-3">
                    <div className="size-[54px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-base font-bold text-ink-900">{e.name}</span>
                        <BadgeCheck className="size-[15px] flex-none text-purple-500" />
                      </div>
                      <div className="mt-0.5 truncate text-[11.5px] text-ink-500">{e.specialties.slice(0, 2).join(" · ")}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11.5px]">
                    <span className="text-warning">★</span>
                    <span className="font-bold text-ink-900">{e.rating.toFixed(1)}</span>
                    <span className="text-ink-400">· {e.priceLabel}</span>
                  </div>
                  <div className="mt-[11px] rounded-xl bg-purple-500/[0.09] px-[11px] py-[9px] text-[11px] font-semibold text-purple-600">
                    {e.reason}
                  </div>
                  <Link href={`/experts/${e._id}`} className="bg-primary-gradient mt-3 flex h-10 w-full items-center justify-center rounded-full text-[13px] font-bold text-white">
                    View profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[22px] border border-white/90 bg-white/85 p-5 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Upcoming</div>
              <div className="rounded-lg bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-500">Tomorrow</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-[46px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
              <div className="flex-1">
                <div className="text-[14.5px] font-bold text-ink-900">Skin Concern Consult</div>
                <div className="mt-0.5 text-[11.5px] text-ink-500">Amara R. · 2:00 PM · 30 min</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2.5">
              <button className="bg-primary-gradient h-10 flex-1 rounded-full text-[13px] font-bold text-white">Join</button>
              <button className="h-10 flex-1 rounded-full border border-purple-600/15 bg-white text-[13px] font-semibold text-ink-700">Reschedule</button>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/90 bg-white/85 p-5 shadow-[0_12px_26px_-10px_rgba(120,80,160,0.2)]">
            <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Your routine</div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="size-2.5 rounded-full bg-warning" />
              <span className="text-[13px] font-semibold text-ink-900">Morning · 4 steps</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-full bg-purple-500" />
              <span className="text-[13px] font-semibold text-ink-900">Evening · 3 steps</span>
            </div>
            <Link href="/routine" className="mt-3.5 block text-xs font-semibold text-purple-500">Open routine →</Link>
          </div>

          <div className="rounded-[22px] border border-purple-500/15 bg-[linear-gradient(135deg,rgba(123,82,196,0.1),rgba(200,120,190,0.1))] p-5">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Community</div>
            <div className="text-[13.5px] font-semibold leading-snug text-ink-900">
              Have a beauty question? Ask it anonymously and hear from real experts.
            </div>
            <Link href="/community" className="mt-3 block text-xs font-semibold text-purple-500">Ask now →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
