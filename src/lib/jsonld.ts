import { packageContent, siteConfig } from "@/content/site";

const organizationId = `${siteConfig.url}/#organization`;
const venueId = `${siteConfig.url}/#venue`;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      publisher: { "@id": organizationId },
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/wp-content/uploads/2017/09/Words-small-trans-green.png`,
      sameAs: [siteConfig.facebook],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.phoneHref,
        email: siteConfig.email,
        contactType: "customer service",
        areaServed: "US-CA",
        availableLanguage: "English",
      },
    },
    {
      "@type": ["LocalBusiness", "EventVenue"],
      "@id": venueId,
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: siteConfig.phoneHref,
      email: siteConfig.email,
      image: `${siteConfig.url}/wp-content/uploads/2017/09/Untitled-design-8.jpg`,
      parentOrganization: { "@id": organizationId },
      address: {
        "@type": "PostalAddress",
        ...siteConfig.address,
      },
      maximumAttendeeCapacity: 150,
      sameAs: [siteConfig.facebook],
    },
  ],
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}

export function serviceJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: new URL(path, siteConfig.url).toString(),
    provider: { "@id": venueId },
    areaServed: {
      "@type": "City",
      name: "Bakersfield",
    },
  };
}

export const packagesJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Leaning Oak Ranch Wedding Packages",
  url: `${siteConfig.url}/information/`,
  itemListElement: packageContent.prices.map((price) => ({
    "@type": "Offer",
    name: `${packageContent.name}, ${price.range}`,
    price: price.price.replace(/[$,]/g, ""),
    priceCurrency: "USD",
    itemOffered: {
      "@type": "Service",
      name: packageContent.name,
      provider: { "@id": venueId },
    },
  })),
};

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: packageContent.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
