import type { Metadata } from "next";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { TrackedLink } from "@/components/tracked-link";
import { packageContent, seo } from "@/content/site";
import { breadcrumbJsonLd, faqJsonLd, packagesJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.information);

export default function InformationPage() {
  return (
    <>
      <PageHero title="Package Information" eyebrow="Weddings at Leaning Oak Ranch" image="/wp-content/uploads/2017/09/Untitled-design-21-min.jpg" compact>
        <p>Outdoor garden wedding and reception packages for celebrations of up to 150 guests.</p>
      </PageHero>

      <section className="package-section section-shell">
        <div className="section-heading"><p className="eyebrow green">Package Details</p><h2>{packageContent.name}</h2></div>
        <div className="package-layout">
          <div className="included-panel">
            <h3>Included Services</h3>
            <ul className="check-list">{packageContent.included.map((item) => <li key={item}><Check size={20} weight="bold" aria-hidden="true" />{item}</li>)}</ul>
          </div>
          <div className="price-panel">
            <p>Wedding Ceremony &amp; Reception</p>
            {packageContent.prices.map((item) => <div className="price" key={item.range}><span>{item.range}</span><strong>{item.price}</strong></div>)}
            <TrackedLink href="/contact-us/" className="button button-light" event="schedule_tour">Schedule a Tour</TrackedLink>
          </div>
        </div>
      </section>

      <section className="details-band">
        <div className="section-shell details-grid">
          <article><h2>Complimentary Decor List</h2><ul>{packageContent.decor.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h2>Create Your Own Package Add-Ons</h2><p>(Ask for Pricing)</p><ul>{packageContent.addOns.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className="pricing-notice section-shell" aria-label="Pricing notice">
        {packageContent.notices.map((notice) => <p key={notice}>{notice}</p>)}
      </section>

      <section className="faq-section section-shell">
        <div className="section-heading"><p className="eyebrow green">Before You Book</p><h2>Frequently Asked Questions</h2></div>
        <div className="faq-list">
          {packageContent.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <JsonLd data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Packages", path: "/information/" }]),
        serviceJsonLd("Wedding Packages", seo.information.description, "/information/"),
        packagesJsonLd,
        faqJsonLd,
      ]} />
    </>
  );
}
