import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@dew/backend/api";
import type { Id } from "@dew/backend/dataModel";
import { BookingFlow } from "./booking-flow";

export const dynamic = "force-dynamic";

export default async function Booking({
  searchParams,
}: {
  searchParams: Promise<{ expert?: string }>;
}) {
  const { expert: expertId } = await searchParams;
  const expert = expertId
    ? await fetchQuery(api.experts.get, { id: expertId as Id<"experts"> }).catch(() => null)
    : null;

  if (!expert) {
    return (
      <div className="mx-auto w-full max-w-[720px]">
        <div className="rounded-[24px] border border-white/90 bg-white/85 p-10 text-center shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
          <div className="font-display text-xl font-semibold text-ink-900">Choose an expert to book</div>
          <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-ink-500">
            Pick the expert you&apos;d like a consult with, then choose a time.
          </p>
          <Link href="/experts" className="bg-primary-gradient mt-4 inline-flex h-11 items-center rounded-[22px] px-6 text-[13.5px] font-bold text-white shadow-glow">
            Browse experts
          </Link>
        </div>
      </div>
    );
  }

  return <BookingFlow expert={expert} />;
}
