import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { initializeAnalytics, saveConsent, trackEvent, trackPageView } from "@/lib/analytics";

beforeEach(() => {
  vi.stubGlobal("window", {
    location: { hostname: "www.leaningoakranch.com" },
    localStorage: { getItem: vi.fn(() => "accepted"), setItem: vi.fn() },
    gtag: vi.fn(),
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("does not track without consent or on local preview hosts", () => {
  vi.mocked(window.localStorage.getItem).mockReturnValue("declined");
  trackEvent("generate_lead");
  expect(initializeAnalytics("G-TEST")).toBe(false);
  expect(window.gtag).not.toHaveBeenCalled();
  vi.mocked(window.localStorage.getItem).mockReturnValue("accepted");
  window.location.hostname = "localhost";
  trackEvent("generate_lead");
  expect(window.gtag).not.toHaveBeenCalled();
});

it("sends one manual page view without query parameters or fragments", () => {
  expect(initializeAnalytics("G-TEST")).toBe(true);
  expect(window.gtag).toHaveBeenCalledWith("config", "G-TEST", expect.objectContaining({ send_page_view: false }));
  trackPageView("/contact-us/?email=private#message", "/information/?private=value");
  expect(window.gtag).toHaveBeenCalledWith("event", "page_view", expect.objectContaining({
    page_location: "https://www.leaningoakranch.com/contact-us/",
    page_referrer: "https://www.leaningoakranch.com/information/",
  }));
});

it("excludes form content from conversion events", () => {
  trackEvent("generate_lead", { form_name: "venue_inquiry", email: "private@example.com", message: "private" });
  expect(window.gtag).toHaveBeenCalledWith("event", "generate_lead", { form_name: "venue_inquiry" });
});

it("does not break visitor actions when storage or tracking is blocked", () => {
  vi.mocked(window.localStorage.getItem).mockImplementation(() => { throw new Error("Blocked"); });
  vi.mocked(window.localStorage.setItem).mockImplementation(() => { throw new Error("Blocked"); });
  vi.mocked(window.gtag!).mockImplementation(() => { throw new Error("Blocked"); });
  expect(() => saveConsent("accepted")).not.toThrow();
  expect(() => trackEvent("generate_lead")).not.toThrow();
  saveConsent("declined");
});
