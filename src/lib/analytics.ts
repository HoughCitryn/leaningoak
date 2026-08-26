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

export function trackEvent(event: AnalyticsEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem("lor-cookie-consent") !== "accepted") return;
  window.gtag?.("event", event, params ?? {});
}
