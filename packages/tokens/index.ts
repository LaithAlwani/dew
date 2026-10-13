// @dew/tokens — single source of design tokens.
//
// The Tailwind v4 preset lives in ./theme.css (imported by app/globals.css);
// that CSS `@theme` block is the sole home of raw hex. This module exposes the
// token *names* for type-safe reference in TS/TSX — components use the Tailwind
// utilities (bg-foundation, text-navy, …) or var(--color-navy), never literals.

export const colorTokens = [
  "foundation",
  "surface",
  "lavender",
  "butter",
  "sage",
  "powder",
  "navy",
  "coral",
] as const;

export type ColorToken = (typeof colorTokens)[number];

export const radiusTokens = ["sm", "md", "lg"] as const;
export type RadiusToken = (typeof radiusTokens)[number];
