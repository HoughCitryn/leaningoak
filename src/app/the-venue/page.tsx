import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { TrackedLink } from "@/components/tracked-link";
import { seo, venueContent } from "@/content/site";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.venue);

const venueImages = [
  ["/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Yard-16-min.jpg", "Grand gazebo surrounded by the ranch gardens"],
  ["/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Yard-8-min.jpg", "Leaning oak tree beside the outdoor bar"],
  ["/wp-content/uploads/2017/09/Leaning-Oak-Ranch-10-min.jpg", "Curving garden path and manicured hedges"],
  ["/wp-content/uploads/2017/09/Leaning-Oak-Ranch-15-min.jpg", "Open-air stone bar prepared for a celebration"],
  ["/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Yard-13-min.jpg", "Path leading through the gardens toward the gazebo"],
  ["/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Yard-17-min.jpg", "Open event lawn beneath mature shade trees"],
] as const;

export default function VenuePage() {
  return (
    <>
      <PageHero title={venueContent.title} eyebrow={venueContent.eyebrow} image="/wp-content/uploads/2017/09/Untitled-design-19-min.jpg" />
      <section className="section-shell venue-intro"><div className="prose-block centered-prose">{venueContent.intro.map((paragraph, index) => index === 0 ? <h2 key={paragraph}>{paragraph}</h2> : <p key={paragraph}>{paragraph}</p>)}</div></section>
      <section className="venue-gallery section-shell" aria-labelledby="venue-gallery-title">
        <div className="section-heading"><p className="eyebrow green">The Grounds</p><h2 id="venue-gallery-title">Photo Gallery</h2></div>
        <div className="venue-image-grid">{venueImages.map(([src, alt]) => <Image key={src} src={src} alt={alt} width={1032} height={580} />)}</div>
        <Link href="/photo-gallery/" className="button button-outline">View All Photos</Link>
      </section>
      <section className="tour-cta parallax-section"><div className="hero-overlay" /><div><h2>Schedule a Free Visit Now!</h2><TrackedLink href="/contact-us/" className="button button-light" event="schedule_tour">Click Here</TrackedLink></div></section>
      <section className="story-section section-shell">
        <Image src="/wp-content/uploads/2017/09/Untitled-design-2-1.jpg" alt="Newlyweds sharing a quiet moment at the ranch" width={1920} height={1200} />
        <div className="prose-block"><p className="eyebrow green">Your Special Day</p><h2>Weddings</h2>{venueContent.weddings.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<TrackedLink href="/contact-us/" className="button button-solid" event="schedule_tour">Request More Info</TrackedLink></div>
      </section>
      <section className="story-section section-shell reverse">
        <Image src="/wp-content/uploads/2017/09/Untitled-design-9.jpg" alt="Evening celebration beneath lights at Leaning Oak Ranch" width={1920} height={1200} />
        <div className="prose-block"><p className="eyebrow green">Gather Together</p><h2>Events</h2>{venueContent.events.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<TrackedLink href="/contact-us/" className="button button-outline" event="schedule_tour">Let’s Party</TrackedLink></div>
      </section>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "The Venue", path: "/the-venue/" }]), serviceJsonLd("Outdoor Wedding Venue", seo.venue.description, "/the-venue/")]} />
    </>
  );
}
