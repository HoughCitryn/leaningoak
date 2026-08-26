import type { Metadata } from "next";
import { Cardo, Josefin_Slab, Open_Sans } from "next/font/google";
import { ConsentBanner } from "@/components/consent-banner";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { organizationJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/content/site";
import "./globals.css";

const cardo = Cardo({ variable: "--font-cardo", subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const josefin = Josefin_Slab({ variable: "--font-josefin", subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: "%s" },
  applicationName: siteConfig.name,
  icons: {
    icon: "/wp-content/uploads/2017/10/4e43547a-1616-4c14-9719-8d9ab88137de.jpg",
    apple: "/wp-content/uploads/2017/10/4e43547a-1616-4c14-9719-8d9ab88137de.jpg",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cardo.variable} ${josefin.variable} ${openSans.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <ConsentBanner measurementId={siteConfig.gaMeasurementId} />
        <JsonLd data={organizationJsonLd} />
      </body>
    </html>
  );
}
