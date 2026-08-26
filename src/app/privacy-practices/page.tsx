import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { privacyIntro, privacySections } from "@/content/privacy";
import { seo } from "@/content/site";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.privacy);

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Website Privacy Practices" image="/wp-content/uploads/2017/09/Untitled-design-3.jpg" compact />
      <article className="legal-content section-shell">
        <p>{privacyIntro}</p>
        {privacySections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.items ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          </section>
        ))}
      </article>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy Practices", path: "/privacy-practices/" }])} />
    </>
  );
}
