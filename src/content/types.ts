export type SiteConfig = {
  name: string;
  legalName: string;
  url: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  facebook: string;
  gaMeasurementId?: string;
};

export type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export type VenuePageContent = {
  eyebrow: string;
  title: string;
  intro: string[];
  weddings: string[];
  events: string[];
};

export type PackageContent = {
  name: string;
  included: string[];
  prices: { range: string; price: string }[];
  decor: string[];
  addOns: string[];
  notices: string[];
  faq: { question: string; answer: string }[];
};

export type GalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const eventTypes = [
  "Wedding Ceremony",
  "Wedding Reception",
  "Ceremony & Reception",
  "Other Event",
] as const;

export type InquirySubmission = {
  name: string;
  email: string;
  phone: string;
  eventType: (typeof eventTypes)[number];
  preferredDate?: string;
  guestCount?: number;
  message: string;
  turnstileToken: string;
  website?: string;
};

export type InquiryResult =
  | { status: "success" }
  | { status: "validation_error"; fieldErrors: Record<string, string[]> }
  | { status: "spam_rejected" }
  | { status: "delivery_error" };
