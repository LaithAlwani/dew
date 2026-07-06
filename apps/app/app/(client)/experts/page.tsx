import Link from "next/link";
import { BadgeCheck, Search } from "lucide-react";

const CHIPS = ["Best match", "Skincare", "Makeup", "Bridal", "Beginner", "Budget", "Luxury", "Acne", "Shade match"];

const EXPERTS = [
  { name: "Amara R.", title: "Licensed Esthetician", rating: "4.9", price: "from $25", reason: "Strong match for acne concerns + your budget", tags: ["Acne", "Beginners", "Budget"] },
  { name: "Noor S.", title: "Makeup Artist", rating: "4.8", price: "free intro", reason: "Great for everyday, natural looks", tags: ["Natural", "Soft glam", "Events"] },
  { name: "Lena V.", title: "Bridal Specialist", rating: "5.0", price: "from $60", reason: "Top-rated for bridal & special events", tags: ["Bridal", "Full glam", "Trials"] },
  { name: "Priya M.", title: "Skincare Coach", rating: "4.9", price: "from $30", reason: "Loved for sensitive-skin routines", tags: ["Sensitive", "Routine", "Dryness"] },
  { name: "Jade W.", title: "Color & Shade Pro", rating: "4.7", price: "from $20", reason: "Best for finding your perfect shade", tags: ["Shade match", "Foundation", "Undertone"] },
  { name: "Sana P.", title: "Clean Beauty Expert", rating: "4.8", price: "from $28", reason: "Great for clean, minimal routines", tags: ["Clean beauty", "Minimal", "Vegan"] },
];

export default function Experts() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-ink-400">Marketplace</div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink-900">Find your beauty expert</h1>
      </div>

      {/* mobile search (shell top bar is desktop-only) */}
      <div className="mb-5 flex h-11 items-center gap-2.5 rounded-full border border-purple-600/10 bg-white/75 px-4 lg:hidden">
        <Search className="size-[17px] text-ink-400" />
        <span className="text-[13.5px] text-ink-400">Search concern, style, or expert…</span>
      </div>

      {/* filter chips */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {CHIPS.map((c, i) => (
          <span
            key={c}
            className={
              i === 0
                ? "bg-primary-gradient flex h-[38px] items-center rounded-[19px] px-[17px] text-[13px] font-semibold text-white"
                : "flex h-[38px] items-center rounded-[19px] border border-purple-600/10 bg-white/85 px-[17px] text-[13px] font-semibold text-ink-700"
            }
          >
            {c}
          </span>
        ))}
      </div>

      {/* expert grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {EXPERTS.map((e) => (
          <div key={e.name} className="rounded-[24px] border border-white/90 bg-white/[0.88] p-5 shadow-[0_14px_30px_-12px_rgba(120,80,160,0.22)]">
            <div className="flex gap-3.5">
              <div className="size-[66px] flex-none rounded-full bg-[url('/makeup.jpg')] bg-cover bg-center" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-bold text-ink-900">{e.name}</span>
                  <BadgeCheck className="size-[15px] text-purple-500" />
                </div>
                <div className="mt-0.5 text-xs text-ink-500">{e.title}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  <span className="text-warning">★</span>
                  <span className="font-bold text-ink-900">{e.rating}</span>
                  <span className="text-ink-400">· {e.price}</span>
                </div>
              </div>
            </div>
            <div className="mt-[13px] rounded-[13px] bg-purple-500/[0.09] px-3 py-2.5 text-[11.5px] font-semibold leading-snug text-purple-600">
              {e.reason}
            </div>
            <div className="mt-[13px] flex flex-wrap gap-[7px]">
              {e.tags.map((t) => (
                <span key={t} className="rounded-xl border border-purple-600/10 bg-white/90 px-[11px] py-[5px] text-[11px] font-semibold text-ink-700">{t}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-2.5">
              <button className="bg-primary-gradient h-[42px] flex-1 rounded-[21px] text-[13px] font-bold text-white">Book</button>
              <Link href="/experts/amara" className="flex h-[42px] flex-1 items-center justify-center rounded-[21px] border border-purple-600/15 bg-white text-[13px] font-semibold text-ink-700">
                View profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
