import type { Metadata } from "next";
import { Envelope, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { InquiryForm } from "@/components/inquiry-form";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { TrackedLink } from "@/components/tracked-link";
import { seo, siteConfig } from "@/content/site";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.contact);

export default function ContactPage() {
  return (
    <>
      <PageHero title="Book Your Date Today!" eyebrow="Leaning Oak Ranch" image="/wp-content/uploads/2017/09/Untitled-design-8.jpg" compact>
        <p>Send us a message about your upcoming event.</p>
      </PageHero>
      <section className="contact-section section-shell">
        <div className="contact-details">
          <p className="eyebrow green">Contact Us</p>
          <h2>Let’s Talk About Your Event</h2>
          <p>Ask about available dates, package details, or schedule a private tour of the ranch.</p>
          <address>
            <div><MapPin size={26} weight="light" aria-hidden="true" /><span>{siteConfig.address.streetAddress}<br />{siteConfig.address.addressLocality}, {siteConfig.address.addressRegion} {siteConfig.address.postalCode}</span></div>
            <div><Envelope size={26} weight="light" aria-hidden="true" /><TrackedLink href={`mailto:${siteConfig.email}`} event="click_email">{siteConfig.email}</TrackedLink></div>
            <div><Phone size={26} weight="light" aria-hidden="true" /><TrackedLink href={`tel:${siteConfig.phoneHref}`} event="click_to_call">{siteConfig.phoneDisplay}</TrackedLink></div>
          </address>
        </div>
        <div className="form-panel"><h2>Event Inquiry</h2><InquiryForm /></div>
      </section>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact Us", path: "/contact-us/" }]),
        serviceJsonLd("Venue Tours and Event Inquiries", seo.contact.description, "/contact-us/"),
      ]} />
    </>
  );
}
