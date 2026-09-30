import { galleryImages, venueGalleryImages } from "@/content/gallery";
import { siteConfig } from "@/content/site";

const routeImages = [
  {
    loc: `${siteConfig.url}/`,
    images: [
      "/wp-content/uploads/2017/09/Untitled-design-8.jpg",
      "/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-04-min.jpg",
      "/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-03-min.jpg",
      "/wp-content/uploads/2017/09/Untitled-design-20-min.jpg",
      "/wp-content/uploads/2017/09/Untitled-design-4.jpg",
    ],
  },
  {
    loc: `${siteConfig.url}/the-venue/`,
    images: [
      "/wp-content/uploads/2017/09/Untitled-design-19-min.jpg",
      ...venueGalleryImages.map((image) => image.src),
      "/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-05-min.jpg",
      "/wp-content/uploads/2017/09/Leaning-Oak-Ranch-Makenzie-Photography-02-min.jpg",
    ],
  },
  {
    loc: `${siteConfig.url}/information/`,
    images: ["/wp-content/uploads/2017/09/Untitled-design-21-min.jpg"],
  },
  {
    loc: `${siteConfig.url}/photo-gallery/`,
    images: ["/wp-content/uploads/2017/09/Untitled-design-20-min.jpg", ...galleryImages.map((image) => image.src)],
  },
  {
    loc: `${siteConfig.url}/contact-us/`,
    images: ["/wp-content/uploads/2017/09/Untitled-design-8.jpg"],
  },
  {
    loc: `${siteConfig.url}/privacy-practices/`,
    images: ["/wp-content/uploads/2017/09/Untitled-design-3.jpg"],
  },
];

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const body = routeImages
    .map(({ loc, images }) => `<url><loc>${escapeXml(loc)}</loc>${images.map((image) => `<image:image><image:loc>${escapeXml(new URL(image, siteConfig.url).toString())}</image:loc></image:image>`).join("")}</url>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
