import type { MetadataRoute } from "next";
import { seo, siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(seo).map(({ path }) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: path === "/privacy-practices/" ? "yearly" : "monthly",
    priority: path === "/" ? 1 : path === "/contact-us/" || path === "/information/" ? 0.9 : 0.8,
  }));
}
