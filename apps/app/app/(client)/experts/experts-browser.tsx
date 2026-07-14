"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { ExpertGrid } from "./expert-grid";

// Chips are preset search terms; "Best match" clears the filter.
const CHIPS: { label: string; term: string }[] = [
  { label: "Best match", term: "" },
  { label: "Skincare", term: "skincare" },
  { label: "Makeup", term: "makeup" },
  { label: "Bridal", term: "bridal" },
  { label: "Beginner", term: "beginner" },
  { label: "Budget", term: "budget" },
  { label: "Luxury", term: "full glam" },
  { label: "Acne", term: "acne" },
  { label: "Shade match", term: "shade" },
];

export function ExpertsBrowser() {
  const [query, setQuery] = React.useState(""); // free-text box
  const [chip, setChip] = React.useState(""); // active chip term ("" = Best match)
  const [debounced, setDebounced] = React.useState("");

  // Typed text wins over the chip; otherwise the chip term applies.
  const effective = query.trim() || chip;

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(effective), 250);
    return () => clearTimeout(t);
  }, [effective]);

  // Highlight a chip only when the user isn't typing a free-text search.
  const activeLabel = query.trim()
    ? null
    : (CHIPS.find((c) => c.term === chip)?.label ?? "Best match");

  return (
    <>
      {/* search box */}
      <div className="mb-4 flex h-11 items-center gap-2.5 rounded-full border border-purple-600/10 bg-white/75 px-4">
        <Search className="size-[17px] flex-none text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concern, style, or expert…"
          aria-label="Search experts"
          className="w-full min-w-0 bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="flex size-6 flex-none items-center justify-center rounded-full text-ink-400 transition hover:bg-purple-500/10 hover:text-ink-700"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* filter chips */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {CHIPS.map((c) => {
          const on = activeLabel === c.label;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                setChip(c.term);
                setQuery("");
              }}
              className={
                on
                  ? "bg-primary-gradient flex h-[38px] items-center rounded-[19px] px-[17px] text-[13px] font-semibold text-white"
                  : "flex h-[38px] items-center rounded-[19px] border border-purple-600/10 bg-white/85 px-[17px] text-[13px] font-semibold text-ink-700 transition hover:border-purple-600/25"
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <ExpertGrid search={debounced} />
    </>
  );
}
