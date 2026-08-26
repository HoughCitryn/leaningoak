"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

type Consent = "accepted" | "declined" | null;
const storageKey = "lor-cookie-consent";

export function ConsentBanner({ measurementId }: { measurementId?: string }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(storageKey);
      setConsent(stored === "accepted" || stored === "declined" ? stored : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(value: Exclude<Consent, null>) {
    window.localStorage.setItem(storageKey, value);
    setConsent(value);
  }

  return (
    <>
      {consent === "accepted" && measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="leaning-oak-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {ready && consent === null ? (
        <aside className="cookie-banner" aria-label="Cookie preferences">
          <p>
            We use optional analytics cookies to understand how visitors use our
            website. Read our <Link href="/privacy-practices/">Privacy Practices</Link>.
          </p>
          <div className="cookie-actions">
            <button type="button" className="button button-solid" onClick={() => choose("accepted")}>
              Accept
            </button>
            <button type="button" className="button button-light" onClick={() => choose("declined")}>
              Decline
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
