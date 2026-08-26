import type { Metadata } from "next";
import { Heart, Martini, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { TrackedLink } from "@/components/tracked-link";
import { homeContent, seo } from "@/content/site";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.home);
const serviceIcons = [Heart, UsersThree, Martini];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-overlay" />
        <div className="home-hero-inner">
          <div>
            <p className="eyebrow">Bakersfield’s Premier Event Venue</p>
            <h1>{homeContent.title}</h1>
            <div className="hero-actions">
              <TrackedLink href="/contact-us/" className="button button-light" event="schedule_tour">Schedule a Tour</TrackedLink>
              <TrackedLink href="/information/" className="text-link light-link" event="view_packages">View Packages</TrackedLink>
            </div>
          </div>
          <Image src="/wp-content/uploads/2017/09/Logo-white-small.png" alt="Leaning Oak Ranch tree emblem" width={331} height={362} priority />
        </div>
      </section>

      <section className="intro-section section-shell">
        <div className="intro-collage" aria-label="Wedding and gazebo photographs">
          <Image src="/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-04-min.jpg" alt="Floral reception table beneath the ranch gazebo" width={800} height={1000} />
          <Image src="/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-03-min.jpg" alt="Bride and groom celebrating at Leaning Oak Ranch" width={800} height={1000} />
        </div>
        <div className="prose-block">
          <p className="eyebrow green">Welcome to the Ranch</p>
          <h2>{homeContent.subtitle}</h2>
          {homeContent.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link href="/the-venue/" className="button button-outline">See The Venue</Link>
        </div>
      </section>

      <section className="service-section parallax-section">
        <div className="hero-overlay" />
        <div className="section-shell service-inner">
          <h2>Venue Service Options</h2>
          <div className="service-list">
            {homeContent.services.map((service, index) => {
              const Icon = serviceIcons[index];
              return <article key={service.title}><Icon size={44} weight="light" aria-hidden="true" /><h3>{service.title}</h3><p>{service.body}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="package-teaser section-shell">
        <div>
          <p className="eyebrow green">Plan Your Celebration</p>
          <h2>View Our Event Package Information</h2>
          <p>Explore our venue package, included services, complimentary decor, add-ons, pricing, and frequently asked questions.</p>
          <TrackedLink href="/information/" className="button button-solid" event="view_packages">Package Information</TrackedLink>
        </div>
        <Image src="/wp-content/uploads/2017/09/Untitled-design-4.jpg" alt="Bride and groom outdoors at Leaning Oak Ranch" width={800} height={1000} />
      </section>

      <section className="contact-strip">
        <div className="section-shell"><h2>Schedule a Free Visit</h2><p>See the gardens, gazebo, outdoor bar, and private event spaces in person.</p><TrackedLink href="/contact-us/" className="button button-light" event="schedule_tour">Book Your Tour</TrackedLink></div>
      </section>

      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }]), serviceJsonLd("Outdoor Weddings and Events", seo.home.description, "/")]} />
    </>
  );
}
