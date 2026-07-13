import type { MetadataRoute } from "next";
import { abs } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: abs("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: abs("/get-started"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: abs("/tour"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: abs("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/terms"), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
