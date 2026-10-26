"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { initializeAnalytics, isAnalyticsHost, readConsent, saveConsent, trackPageView, type Consent } from "@/lib/analytics";

export function ConsentBanner({ measurementId }: { measurementId?: string }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConsent(readConsent());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (consent !== "accepted" || !measurementId) return;
    if (!initialized.current) initialized.current = initializeAnalytics(measurementId);
    if (initialized.current && lastPath.current !== pathname) {
      trackPageView(pathname, lastPath.current);
      lastPath.current = pathname;
    }
  }, [consent, measurementId, pathname]);

  function choose(value: Exclude<Consent, null>) {
    saveConsent(value);
    setConsent(value);
    setPreferencesOpen(false);
    // Reload to unload an already-running Google tag when consent is withdrawn.
    if (value === "declined" && initialized.current) window.location.reload();
  }

  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return null;

  return (
    <>
      {consent === "accepted" && isAnalyticsHost() ? (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
      ) : null}

      {ready && (consent === null || preferencesOpen) ? (
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
      ) : ready ? <button type="button" className="cookie-preferences" onClick={() => setPreferencesOpen(true)}>Cookie preferences</button> : null}
    </>
  );
}
