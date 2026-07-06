import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest. Makes app.domain.com installable.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dew — beauty guidance that fits you",
    short_name: "Dew",
    description: "Personalized beauty guidance that actually fits you.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf8ff",
    theme_color: "#faf8ff",
    icons: [
      {
        src: "/logo.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/logo.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
