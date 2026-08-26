import { FacebookLogo } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { navigation, siteConfig } from "@/content/site";
import { TrackedLink } from "./tracked-link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h2>Leaning Oak Ranch</h2>
          <nav aria-label="Footer navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <Link href="/privacy-practices/">Privacy Practices</Link>
          </nav>
        </div>

        <div className="footer-contact">
          <Image
            src="/wp-content/uploads/2017/09/Leaning-Oak-Rancg-Logo-White.png"
            alt=""
            width={1851}
            height={1062}
          />
          <p>
            Email us at{" "}
            <TrackedLink href={`mailto:${siteConfig.email}`} event="click_email">
              {siteConfig.email}
            </TrackedLink>
          </p>
          <p>
            Or call us at{" "}
            <TrackedLink href={`tel:${siteConfig.phoneHref}`} event="click_to_call">
              {siteConfig.phoneDisplay}
            </TrackedLink>
          </p>
          <address>
            {siteConfig.address.streetAddress}, {siteConfig.address.addressLocality},{" "}
            {siteConfig.address.addressRegion} {siteConfig.address.postalCode}
          </address>
        </div>

        <div className="footer-meta">
          <h2>Follow Us</h2>
          <a href={siteConfig.facebook} target="_blank" rel="noreferrer" aria-label="Leaning Oak Ranch on Facebook">
            <FacebookLogo size={28} weight="fill" />
          </a>
          <p>© {new Date().getFullYear()} Leaning Oak Ranch. All Rights Reserved.</p>
          <p>
            Powered &amp; Designed by{" "}
            <a href="https://citryn.com" target="_blank" rel="noreferrer">Citryn, LLC</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
