// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));

import { POST } from "@/app/api/inquiry/route";

const payload = {
  name: "Taylor Reed",
  email: "taylor@example.com",
  phone: "661-555-0199",
  eventType: "Wedding Reception",
  guestCount: "80",
  preferredDate: "2027-10-16",
  message: "Please send information about scheduling a private venue tour.",
  turnstileToken: "token",
  website: "",
};

describe("POST /api/inquiry", () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "turnstile-secret";
    process.env.RESEND_API_KEY = "resend-key";
    process.env.RESEND_FROM_EMAIL = "Leaning Oak Ranch <inquiries@leaningoakranch.com>";
    mocks.send.mockResolvedValue({ data: { id: "email-id" }, error: null });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("verifies Turnstile and sends through Resend", async () => {
    const request = new Request("https://www.leaningoakranch.com/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.8" },
      body: JSON.stringify(payload),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "success" });
    expect(fetch).toHaveBeenCalledOnce();
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({
      to: "barbara@leaningoakranch.com",
      replyTo: payload.email,
    }));
  });

  it("returns validation_error for malformed submissions", async () => {
    const request = new Request("https://www.leaningoakranch.com/api/inquiry", { method: "POST", body: JSON.stringify({}) });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect((await response.json()).status).toBe("validation_error");
  });

  it("returns spam_rejected when Turnstile rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    const request = new Request("https://www.leaningoakranch.com/api/inquiry", { method: "POST", body: JSON.stringify(payload) });
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect((await response.json()).status).toBe("spam_rejected");
  });

  it("returns delivery_error when Resend fails", async () => {
    mocks.send.mockResolvedValue({ data: null, error: { message: "failed" } });
    const request = new Request("https://www.leaningoakranch.com/api/inquiry", { method: "POST", body: JSON.stringify(payload) });
    const response = await POST(request);
    expect(response.status).toBe(502);
    expect((await response.json()).status).toBe("delivery_error");
  });
});
