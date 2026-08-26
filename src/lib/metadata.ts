import type { Metadata } from "next";
import type { PageSeo } from "@/content/types";
import { siteConfig } from "@/content/site";

export function createMetadata(page: PageSeo): Metadata {
  const canonical = new URL(page.path, siteConfig.url).toString();
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: siteConfig.name,
      title: page.title,
      description: page.description,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Leaning Oak Ranch wedding venue in Bakersfield, California",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${siteConfig.url}/opengraph-image`],
    },
  };
}
