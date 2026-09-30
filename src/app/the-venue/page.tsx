import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { TrackedLink } from "@/components/tracked-link";
import { seo, venueContent } from "@/content/site";
import { venueGalleryImages } from "@/content/gallery";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.venue);

export default function VenuePage() {
  return (
    <>
      <PageHero title={venueContent.title} eyebrow={venueContent.eyebrow} image="/wp-content/uploads/2017/09/Untitled-design-19-min.jpg" />
      <section className="section-shell venue-intro"><div className="prose-block centered-prose">{venueContent.intro.map((paragraph, index) => index === 0 ? <h2 key={paragraph}>{paragraph}</h2> : <p key={paragraph}>{paragraph}</p>)}</div></section>
      <section className="venue-gallery section-shell" aria-labelledby="venue-gallery-title">
        <div className="section-heading"><h2 id="venue-gallery-title">Photo Gallery</h2><h3 className="section-subheading">The Grounds</h3></div>
        <GalleryLightbox images={venueGalleryImages} previewCount={6} />
        <Link href="/photo-gallery/" className="button button-outline">View All Photos</Link>
      </section>
      <section className="tour-cta parallax-section"><div className="hero-overlay" /><div><h2>Schedule a Free Visit Now!</h2><TrackedLink href="/contact-us/" className="button button-light" event="schedule_tour">Click Here</TrackedLink></div></section>
      <section className="story-section section-shell">
        <Image src="/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-05-min.jpg" alt="Bride and groom beneath a chandelier in the ranch garden" width={800} height={1000} sizes="(max-width: 767px) 100vw, 50vw" />
        <div className="prose-block"><p className="eyebrow green">Your Special Day</p><h2>Weddings</h2>{venueContent.weddings.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<TrackedLink href="/contact-us/" className="button button-solid" event="schedule_tour">Request More Info</TrackedLink></div>
      </section>
      <section className="story-section section-shell reverse">
        <Image src="/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-02-min.jpg" alt="Guests enjoying an outdoor celebration at Leaning Oak Ranch" width={800} height={1000} sizes="(max-width: 767px) 100vw, 50vw" />
        <div className="prose-block"><p className="eyebrow green">Gather Together</p><h2>Events</h2>{venueContent.events.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<TrackedLink href="/contact-us/" className="button button-outline" event="schedule_tour">Let’s Party</TrackedLink></div>
      </section>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "The Venue", path: "/the-venue/" }]), serviceJsonLd("Outdoor Wedding Venue", seo.venue.description, "/the-venue/")]} />
    </>
  );
}
