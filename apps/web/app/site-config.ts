/**
 * Single source of truth for the marketing site's SEO/identity.
 * Set NEXT_PUBLIC_SITE_URL to the real production origin (no trailing slash)
 * before launch — everything canonical/OG/sitemap derives from it.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dewbeautyapp.com"
).replace(/\/$/, "");

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://app.localhost:3000";

export const SITE = {
  name: "Dew",
  legalName: "Dew",
  tagline: "Beauty guidance that fits you",
  title: "Dew — beauty guidance that fits you",
  description:
    "Dew matches you with vetted beauty experts around your real goals, concerns, budget and experience — so you can stop chasing trends and start choosing what actually works for you.",
  shortDescription:
    "Get matched with vetted beauty experts around your real goals, budget and skin.",
  locale: "en_US",
  twitter: "@dewbeautyapp",
  themeColor: "#7B52C4",
  keywords: [
    "beauty guidance",
    "beauty experts",
    "personalized skincare",
    "skincare advice",
    "makeup experts",
    "beauty consultation",
    "expert matching",
    "shade match",
    "beauty routine",
    "vetted estheticians",
  ],
} as const;

export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
