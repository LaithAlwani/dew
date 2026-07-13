import { ImageResponse } from "next/og";
import { SITE } from "../app/site-config";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${SITE.name} — ${SITE.tagline}`;
export const ogContentType = "image/png";

const chip = (label: string) => (
  <div
    key={label}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "12px 22px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.14)",
      border: "1px solid rgba(255,255,255,0.28)",
      fontSize: 24,
      fontWeight: 600,
      color: "#fff",
    }}
  >
    {label}
  </div>
);

/** Shared 1200×630 social card used by both opengraph-image and twitter-image. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg,#6D4AA0 0%,#8657C8 55%,#A85EB8 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -100,
            width: 440,
            height: 440,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.20), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,214,236,0.24), transparent 70%)",
          }}
        />

        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50% 50% 50% 4px",
              background: "#ffffff",
              transform: "rotate(45deg)",
              marginRight: 18,
            }}
          />
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: 1 }}>Dew</div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.03, maxWidth: 940 }}>
            Beauty guidance that fits you.
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.86)",
              maxWidth: 860,
            }}
          >
            {SITE.shortDescription}
          </div>
        </div>

        {/* Chips */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Vetted experts", "Matched to your goals", "Real budgets"].map(chip)}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
