import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryForm } from "@/components/inquiry-form";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next/script", () => ({ default: () => null }));

let solve: (token: string) => void;
const remove = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
  window.turnstile = {
    render: vi.fn((_container, options) => { solve = options.callback; return "widget-id"; }),
    remove,
  };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); delete window.turnstile; });

function form() {
  render(<InquiryForm />);
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Test Visitor" } });
  act(() => solve("first-token"));
  return screen.getByRole("button", { name: "Send Inquiry" });
}

describe("inquiry form retries", () => {
  it.each(["delivery_error", "spam_rejected"])("gets a fresh challenge after %s while preserving inputs", async (status) => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ status }) });
    vi.stubGlobal("fetch", fetcher);
    const button = form();
    fireEvent.click(button);
    await waitFor(() => expect(remove).toHaveBeenCalled());
    expect(screen.getByLabelText("Name")).toHaveValue("Test Visitor");
    expect(button).toBeDisabled();
    expect(trackEvent).not.toHaveBeenCalled();
    act(() => solve("replacement-token"));
    fireEvent.click(button);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetcher.mock.calls[1][1].body).turnstileToken).toBe("replacement-token");
  });

  it("keeps successful delivery separate from tracking and clears the form", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "success" }) }));
    fireEvent.click(form());
    await screen.findByText(/Your inquiry has been sent/);
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(trackEvent).toHaveBeenCalledWith("generate_lead", { form_name: "venue_inquiry" });
  });

  it("resets verification after network errors and prevents concurrent sends", async () => {
    let reject!: (error: Error) => void;
    const fetcher = vi.fn(() => new Promise((_resolve, r) => { reject = r; }));
    vi.stubGlobal("fetch", fetcher);
    const button = form();
    fireEvent.submit(button.closest("form")!);
    fireEvent.submit(button.closest("form")!);
    expect(fetcher).toHaveBeenCalledOnce();
    await act(async () => reject(new Error("Offline")));
    expect(remove).toHaveBeenCalled();
    expect(screen.getByLabelText("Name")).toHaveValue("Test Visitor");
  });

  it("focuses and describes validation errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ status: "validation_error", fieldErrors: { email: ["Enter a valid email."] } }) }));
    fireEvent.click(form());
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Enter a valid email.");
  });
});
