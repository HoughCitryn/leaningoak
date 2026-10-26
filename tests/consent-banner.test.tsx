import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ConsentBanner } from "@/components/consent-banner";

const analytics = vi.hoisted(() => ({
  initializeAnalytics: vi.fn(() => true), isAnalyticsHost: vi.fn(() => true),
  readConsent: vi.fn<() => "accepted" | "declined" | null>(() => null),
  saveConsent: vi.fn(), trackPageView: vi.fn(),
  pathname: "/",
}));
vi.mock("@/lib/analytics", () => analytics);
vi.mock("next/navigation", () => ({ usePathname: () => analytics.pathname }));
vi.mock("next/script", () => ({ default: ({ src }: { src: string }) => <span data-testid="google-tag" data-src={src} /> }));

beforeEach(() => { vi.clearAllMocks(); analytics.pathname = "/"; analytics.readConsent.mockReturnValue(null); });
afterEach(cleanup);

it("does not load Analytics or send page views until accepted, and deduplicates renders", async () => {
  const view = render(<ConsentBanner measurementId="G-TEST" />);
  await screen.findByRole("button", { name: "Accept" });
  expect(screen.queryByTestId("google-tag")).toBeNull();
  expect(analytics.trackPageView).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
  await waitFor(() => expect(analytics.trackPageView).toHaveBeenCalledWith("/", undefined));
  expect(screen.getByTestId("google-tag")).toHaveAttribute("data-src", "https://www.googletagmanager.com/gtag/js?id=G-TEST");
  view.rerender(<ConsentBanner measurementId="G-TEST" />);
  expect(analytics.trackPageView).toHaveBeenCalledTimes(1);
  analytics.pathname = "/contact-us/";
  view.rerender(<ConsentBanner measurementId="G-TEST" />);
  await waitFor(() => expect(analytics.trackPageView).toHaveBeenCalledWith("/contact-us/", "/"));
  expect(analytics.initializeAnalytics).toHaveBeenCalledOnce();
});

it("honors decline and allows revisiting the preference", async () => {
  render(<ConsentBanner measurementId="G-TEST" />);
  fireEvent.click(await screen.findByRole("button", { name: "Decline" }));
  expect(analytics.saveConsent).toHaveBeenCalledWith("declined");
  expect(screen.queryByTestId("google-tag")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Cookie preferences" }));
  expect(screen.getByRole("button", { name: "Accept" })).toBeVisible();
  expect(analytics.trackPageView).not.toHaveBeenCalled();
});

it("hides the analytics prompt when no measurement ID is configured", async () => {
  const view = render(<ConsentBanner />);
  await waitFor(() => expect(analytics.readConsent).toHaveBeenCalled());
  expect(view.container).toBeEmptyDOMElement();
});
