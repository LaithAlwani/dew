import type { MetadataRoute } from "next";
import { SITE } from "./site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf8ff",
    theme_color: SITE.themeColor,
    categories: ["beauty", "lifestyle", "shopping"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
