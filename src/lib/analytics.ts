export type AnalyticsEvent =
  | "generate_lead"
  | "schedule_tour"
  | "click_to_call"
  | "click_email"
  | "view_packages"
  | "gallery_open";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type Consent = "accepted" | "declined" | null;
let memoryConsent: Consent = null;
const storageKey = "lor-cookie-consent";

export function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "accepted" || value === "declined" ? value : memoryConsent;
  } catch {
    return memoryConsent;
  }
}

export function saveConsent(value: Exclude<Consent, null>) {
  memoryConsent = value;
  try { window.localStorage.setItem(storageKey, value); } catch { /* Consent still applies to this visit. */ }
}

export function isAnalyticsHost() {
  return typeof window !== "undefined" && ["leaningoakranch.com", "www.leaningoakranch.com"].includes(window.location.hostname);
}

export function initializeAnalytics(measurementId: string) {
  if (!isAnalyticsHost() || readConsent() !== "accepted" || !/^G-[A-Z0-9]+$/.test(measurementId)) return false;
  window.dataLayer ??= [];
  // Preserve Google's documented Arguments-object queue format.
  // eslint-disable-next-line prefer-rest-params
  window.gtag ??= function () { window.dataLayer?.push(arguments); };
  window.gtag("js", new Date());
  // Page views are emitted explicitly on Next.js route changes. The existing
  // GA4 stream must keep automatic history-based page views off to avoid duplicates.
  window.gtag("config", measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  return true;
}

export function trackPageView(pathname: string, previousPath?: string) {
  if (!isAnalyticsHost() || readConsent() !== "accepted") return;
  const origin = "https://www.leaningoakranch.com";
  // Deliberately exclude query strings and fragments from analytics.
  const path = pathname.split(/[?#]/)[0];
  let referrer = "";
  try {
    const url = new URL(document.referrer);
    referrer = url.origin + url.pathname;
  } catch { /* Direct visit. */ }
  window.gtag?.("event", "page_view", {
    page_location: origin + path,
    page_title: document.title,
    page_referrer: previousPath ? origin + previousPath.split(/[?#]/)[0] : referrer,
  });
}

export function trackEvent(event: AnalyticsEvent, params?: Record<string, unknown>) {
  if (!isAnalyticsHost() || readConsent() !== "accepted") return;
  // Only known, non-personal event metadata is sent. Never send form values.
  const safeParams = Object.fromEntries(Object.entries(params ?? {}).filter(([key]) => ["form_name", "image_index"].includes(key)));
  try { window.gtag?.("event", event, safeParams); } catch { /* Tracking must never break a visitor action. */ }
}
