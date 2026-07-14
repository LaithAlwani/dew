import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";

/** Combined, searchable text for an expert (name + title + specialties). */
const buildSearchText = (e: {
  name: string;
  title: string;
  specialties: string[];
}) => [e.name, e.title, ...e.specialties].join(" ").toLowerCase();

/**
 * Published experts for the client discovery grid — paginated so the UI can
 * infinite-scroll through hundreds without loading them all at once. When
 * `search` is provided (free-text or a chip term) it runs a full-text search;
 * both paths return the same paginated shape.
 */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const term = args.search?.trim();
    if (term) {
      return await ctx.db
        .query("experts")
        .withSearchIndex("search_experts", (q) =>
          q.search("searchText", term).eq("published", true),
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("experts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/** A single expert profile, or null if it doesn't exist / isn't published. */
export const get = query({
  args: { id: v.id("experts") },
  handler: async (ctx, { id }) => {
    const expert = await ctx.db.get("experts", id);
    if (!expert || !expert.published) return null;
    return expert;
  },
});

// Showcase experts so discovery has real, browsable data before real experts
// onboard. Seed once (idempotent) via `npx convex run experts:seed`.
const SEED = [
  {
    name: "Amara R.",
    title: "Licensed Esthetician",
    bio: "I help overwhelmed beginners build calm, effective skin routines that fit real life and real budgets.",
    specialties: ["Acne", "Beginners", "Budget"],
    rating: 4.9,
    reviewCount: 320,
    priceLabel: "from $25",
    reason: "Strong match for acne concerns + your budget",
    services: [
      { name: "Free Intro Consult", meta: "15 min · video", price: "Free" },
      { name: "Skin Concern Consult", meta: "30 min · video", price: "$25" },
      { name: "Full Routine Review", meta: "45 min · video", price: "$40" },
    ],
  },
  {
    name: "Noor S.",
    title: "Makeup Artist",
    bio: "Natural, everyday looks you can actually recreate — no 20-step routines, just what works for you.",
    specialties: ["Natural", "Soft glam", "Events"],
    rating: 4.8,
    reviewCount: 210,
    priceLabel: "free intro",
    reason: "Great for everyday, natural looks",
    services: [
      { name: "Free Intro Consult", meta: "15 min · video", price: "Free" },
      { name: "Everyday Look Lesson", meta: "40 min · video", price: "$30" },
    ],
  },
  {
    name: "Lena V.",
    title: "Bridal Specialist",
    bio: "Top-rated bridal and special-event artistry, with trials so there are no surprises on the day.",
    specialties: ["Bridal", "Full glam", "Trials"],
    rating: 5.0,
    reviewCount: 148,
    priceLabel: "from $60",
    reason: "Top-rated for bridal & special events",
    services: [
      { name: "Bridal Consult", meta: "30 min · video", price: "$60" },
      { name: "Trial + Look Plan", meta: "60 min · in person", price: "$120" },
    ],
  },
  {
    name: "Priya M.",
    title: "Skincare Coach",
    bio: "Gentle, sustainable routines for sensitive and dry skin — loved for calming the chaos.",
    specialties: ["Sensitive", "Routine", "Dryness"],
    rating: 4.9,
    reviewCount: 276,
    priceLabel: "from $30",
    reason: "Loved for sensitive-skin routines",
    services: [
      { name: "Skin Check-in", meta: "20 min · video", price: "$30" },
      { name: "Routine Rebuild", meta: "45 min · video", price: "$50" },
    ],
  },
  {
    name: "Jade W.",
    title: "Color & Shade Pro",
    bio: "Find your perfect foundation and undertone match — no more buying the wrong shade online.",
    specialties: ["Shade match", "Foundation", "Undertone"],
    rating: 4.7,
    reviewCount: 189,
    priceLabel: "from $20",
    reason: "Best for finding your perfect shade",
    services: [
      { name: "Shade Match Session", meta: "25 min · video", price: "$20" },
    ],
  },
  {
    name: "Sana P.",
    title: "Clean Beauty Expert",
    bio: "Clean, minimal, and vegan-friendly routines that respect your skin and your values.",
    specialties: ["Clean beauty", "Minimal", "Vegan"],
    rating: 4.8,
    reviewCount: 133,
    priceLabel: "from $28",
    reason: "Great for clean, minimal routines",
    services: [
      { name: "Clean Swap Consult", meta: "30 min · video", price: "$28" },
    ],
  },
];

/** Idempotently seed the curated showcase experts (dev). Safe to run repeatedly. */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("experts").take(1);
    if (existing.length > 0) return { seeded: 0 };
    for (const e of SEED) {
      await ctx.db.insert("experts", {
        ...e,
        published: true,
        searchText: buildSearchText(e),
      });
    }
    return { seeded: SEED.length };
  },
});

// Dev-only pools for generating a large browsable pool to exercise pagination.
const FIRST = ["Amara", "Noor", "Lena", "Priya", "Jade", "Sana", "Maya", "Zara", "Iris", "Nina", "Leah", "Tara", "Ava", "Mira", "Yara", "Dana", "Rhea", "Cara", "Elle", "Faye"];
const LAST = "RSVMWPKTLBCDNHGZ";
const TITLES = ["Licensed Esthetician", "Makeup Artist", "Skincare Coach", "Bridal Specialist", "Color & Shade Pro", "Clean Beauty Expert", "Dermal Therapist", "Brow & Lash Artist"];
const SPECS = ["Acne", "Sensitive", "Anti-aging", "Natural", "Soft glam", "Bridal", "Shade match", "Dryness", "Oily skin", "Texture", "Vegan", "Minimal", "Full glam", "Beginners", "Budget"];
const REASONS = ["Strong match for your goals + budget", "Loved for gentle, effective routines", "Top-rated for special events", "Great for everyday, natural looks", "Best for finding your perfect shade", "Highly rated by beginners"];

/** Backfill `searchText` on any experts missing it (e.g. rows seeded earlier). */
export const backfillSearch = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    for await (const e of ctx.db.query("experts")) {
      if (e.searchText === undefined) {
        await ctx.db.patch("experts", e._id, { searchText: buildSearchText(e) });
        updated++;
      }
    }
    return { updated };
  },
});

/** Dev: generate `count` extra experts to exercise infinite scroll. */
export const seedMany = mutation({
  args: { count: v.number() },
  handler: async (ctx, { count }) => {
    for (let i = 0; i < count; i++) {
      const name = `${FIRST[i % FIRST.length]!} ${LAST[(i * 3) % LAST.length]!}.`;
      const s1 = SPECS[i % SPECS.length]!;
      const s2 = SPECS[(i * 5 + 2) % SPECS.length]!;
      const s3 = SPECS[(i * 7 + 4) % SPECS.length]!;
      const price = 15 + ((i * 5) % 60);
      const title = TITLES[i % TITLES.length]!;
      const specialties = [s1, s2, s3];
      await ctx.db.insert("experts", {
        name,
        title,
        bio: `Beauty guidance tailored to your goals — friendly, practical help you can actually use.`,
        specialties,
        rating: Number((4.6 + ((i * 7) % 5) / 10).toFixed(1)),
        reviewCount: 40 + ((i * 37) % 400),
        priceLabel: i % 6 === 0 ? "free intro" : `from $${price}`,
        reason: REASONS[i % REASONS.length]!,
        services: [
          { name: "Free Intro Consult", meta: "15 min · video", price: "Free" },
          { name: "Focused Consult", meta: "30 min · video", price: `$${price}` },
        ],
        published: true,
        searchText: buildSearchText({ name, title, specialties }),
      });
    }
    return { seeded: count };
  },
});
