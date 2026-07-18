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
    icons: [{ src: "/logo.webp", sizes: "any", type: "image/webp" }],
  };
}
