"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@dew/backend/api";
import type { Doc } from "@dew/backend/dataModel";

const PAGE = 20;

/**
 * Infinite-scroll expert grid: loads {PAGE} experts at a time from Convex and
 * fetches the next page automatically as the user nears the bottom.
 */
export function ExpertGrid({ search }: { search?: string }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.experts.list,
    { search: search || undefined },
    { initialNumItems: PAGE },
  );

  const sentinel = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && status === "CanLoadMore") {
          loadMore(PAGE);
        }
      },
      { rootMargin: "800px" }, // start loading well before the bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") return <SkeletonGrid />;

  if (results.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/90 bg-white/80 p-10 text-center">
        <div className="font-display text-xl font-semibold text-ink-900">
          {search ? "No matching experts" : "No experts yet"}
        </div>
        <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-ink-500">
          {search
            ? `Nothing matched “${search}”. Try a different search or pick another category.`
            : "We're curating your matches. Check back shortly — vetted experts are on their way."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((e) => (
          <ExpertCard key={e._id} e={e} />
        ))}
      </div>

      {/* sentinel + status */}
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      {status === "LoadingMore" && (
        <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {status === "Exhausted" && results.length > PAGE && (
        <p className="pt-8 text-center text-[13px] font-semibold text-ink-400">
          You&apos;ve seen every expert ✨
        </p>
      )}
    </>
  );
}

function ExpertCard({ e }: { e: Doc<"experts"> }) {
  return (
    <div className="rounded-[24px] border border-white/90 bg-white/[0.88] p-5 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
      <div className="flex gap-3.5">
        <div className="size-[66px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[17px] font-bold text-ink-900">{e.name}</span>
            <BadgeCheck className="size-[15px] flex-none text-purple-500" />
          </div>
          <div className="mt-0.5 text-xs text-ink-500">{e.title}</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span className="text-warning">★</span>
            <span className="font-bold text-ink-900">{e.rating.toFixed(1)}</span>
            <span className="text-ink-400">· {e.priceLabel}</span>
          </div>
        </div>
      </div>
      <div className="mt-[13px] rounded-[13px] bg-purple-500/[0.09] px-3 py-2.5 text-[11.5px] font-semibold leading-snug text-purple-600">
        {e.reason}
      </div>
      <div className="mt-[13px] flex flex-wrap gap-[7px]">
        {e.specialties.map((t) => (
          <span key={t} className="rounded-xl border border-purple-600/10 bg-white/90 px-[11px] py-[5px] text-[11px] font-semibold text-ink-700">{t}</span>
        ))}
      </div>
      <div className="mt-4 flex gap-2.5">
        <Link href={`/booking?expert=${e._id}`} className="bg-primary-gradient flex h-[42px] flex-1 items-center justify-center rounded-[21px] text-[13px] font-bold text-white">Book</Link>
        <Link href={`/experts/${e._id}`} className="flex h-[42px] flex-1 items-center justify-center rounded-[21px] border border-purple-600/15 bg-white text-[13px] font-semibold text-ink-700">
          View profile
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[24px] border border-white/90 bg-white/70 p-5">
      <div className="flex gap-3.5">
        <div className="size-[66px] flex-none animate-pulse rounded-full bg-purple-500/10" />
        <div className="flex-1 space-y-2 pt-1.5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-purple-500/10" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-purple-500/10" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-purple-500/10" />
        </div>
      </div>
      <div className="mt-4 h-10 animate-pulse rounded-[13px] bg-purple-500/[0.07]" />
      <div className="mt-4 h-[42px] animate-pulse rounded-[21px] bg-purple-500/10" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
