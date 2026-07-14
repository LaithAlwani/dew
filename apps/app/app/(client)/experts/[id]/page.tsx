import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Star } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@dew/backend/api";
import type { Id } from "@dew/backend/dataModel";

export const dynamic = "force-dynamic";

export default async function ExpertProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = await fetchQuery(api.experts.get, {
    id: id as Id<"experts">,
  }).catch(() => null);
  if (!expert) notFound();

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <Link href="/experts" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-400 transition hover:text-ink-700">
        <svg width="7" height="12" viewBox="0 0 9 16" fill="none"><path d="M8 1L1.5 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        All experts
      </Link>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* MAIN */}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-[26px] border border-white/90 bg-white/[0.92] shadow-[0_18px_40px_-14px_rgba(120,80,160,0.24)]">
            <div className="relative h-[150px] bg-[url('/makeup.jpg')] bg-cover bg-center">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(46,36,64,0.5))]" />
            </div>
            <div className="relative -mt-[38px] px-[22px] pb-[22px]">
              <div className="size-[76px] rounded-full border-4 border-white bg-[url('/makeup.jpg')] bg-cover bg-center" />
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[22px] font-bold text-ink-900">{expert.name}</span>
                <BadgeCheck className="size-[17px] text-purple-500" />
              </div>
              <div className="mt-0.5 text-[13px] text-ink-500">{expert.title}</div>
              <div className="mt-2 flex items-center gap-1.5 text-[13px]">
                <Star className="size-[15px] fill-warning text-warning" />
                <span className="font-bold text-ink-900">{expert.rating.toFixed(1)}</span>
                <span className="text-ink-400">· {expert.reviewCount} reviews</span>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {expert.specialties.map((t) => (
                  <span key={t} className="rounded-xl bg-purple-500/[0.09] px-[11px] py-[5px] text-[11.5px] font-semibold text-purple-600">{t}</span>
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-500">{expert.bio}</p>
            </div>
          </div>

          {/* services */}
          <div className="rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="font-display mb-4 text-xl font-semibold text-ink-900">Services &amp; pricing</div>
            <div className="flex flex-col gap-2.5">
              {expert.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-2xl border border-purple-600/10 px-4 py-[15px]">
                  <div>
                    <div className="text-sm font-bold text-ink-900">{s.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink-500">{s.meta}</div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOOKING RAIL */}
        <div className="rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)] lg:sticky lg:top-4">
          <div className="text-[13px] text-ink-500">Consults</div>
          <div className="font-display text-[26px] font-semibold text-ink-900">{expert.priceLabel}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="font-bold text-ink-900">{expert.rating.toFixed(1)}</span>
            <span className="text-ink-400">· {expert.reviewCount} reviews</span>
          </div>
          <Link
            href={`/booking?expert=${expert._id}`}
            className="bg-primary-gradient mt-4 flex h-[48px] w-full items-center justify-center rounded-[24px] text-[14px] font-bold text-white shadow-glow"
          >
            Book a consult
          </Link>
          <Link
            href="/messages"
            className="mt-2.5 flex h-[48px] w-full items-center justify-center rounded-[24px] border border-purple-600/15 bg-white text-[14px] font-semibold text-ink-700"
          >
            Message
          </Link>
          <div className="mt-3.5 rounded-[13px] bg-purple-500/[0.09] px-3 py-2.5 text-[11.5px] font-semibold leading-snug text-purple-600">
            {expert.reason}
          </div>
        </div>
      </div>
    </div>
  );
}
