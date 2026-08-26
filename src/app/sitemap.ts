import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

const routes = ["/", "/the-venue/", "/information/", "/photo-gallery/", "/contact-us/", "/privacy-practices/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path, index) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: path === "/privacy-practices/" ? "yearly" : "monthly",
    priority: index === 0 ? 1 : path === "/contact-us/" || path === "/information/" ? 0.9 : 0.8,
  }));
}
