import type { Metadata } from "next";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { galleryImages } from "@/content/gallery";
import { seo } from "@/content/site";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(seo.gallery);

export default function PhotoGalleryPage() {
  return (
    <>
      <PageHero title="Photo Gallery" eyebrow="Leaning Oak Ranch" image="/wp-content/uploads/2017/09/Untitled-design-20-min.jpg" compact>
        <p>Weddings, receptions, gardens, and gathering spaces across the ranch.</p>
      </PageHero>
      <section className="gallery-section section-shell" aria-label="Leaning Oak Ranch photo gallery"><GalleryLightbox images={galleryImages} /></section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Photo Gallery", path: "/photo-gallery/" }])} />
    </>
  );
}
