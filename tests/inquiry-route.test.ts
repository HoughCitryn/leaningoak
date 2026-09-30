// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn(), sendMail: vi.fn(), createTransport: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));

vi.mock("nodemailer", () => ({ default: { createTransport: mocks.createTransport } }));

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
    vi.stubEnv("TURNSTILE_SECRET_KEY", "turnstile-secret");
    vi.stubEnv("RESEND_API_KEY", "resend-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "Leaning Oak Ranch <inquiries@leaningoakranch.com>");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_SECURE", "false");
    vi.stubEnv("SMTP_USER", "smtp-user");
    vi.stubEnv("SMTP_PASS", "smtp-password");
    vi.stubEnv("SMTP_FROM_EMAIL", "Leaning Oak Ranch <inquiries@leaningoakranch.com>");
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    mocks.send.mockResolvedValue({ data: { id: "email-id" }, error: null });
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
    mocks.sendMail.mockResolvedValue({ accepted: ["barbara@leaningoakranch.com"], rejected: [] });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
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
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("returns delivery_error when Resend fails", async () => {
    mocks.send.mockResolvedValue({ data: null, error: { message: "failed" } });
    const request = new Request("https://www.leaningoakranch.com/api/inquiry", { method: "POST", body: JSON.stringify(payload) });
    const response = await POST(request);
    expect(response.status).toBe(502);
    expect((await response.json()).status).toBe("delivery_error");
  });

  it.each([
    ["587", "false", false],
    ["465", "true", true],
  ])("sends through SMTP on port %s with the visitor as reply-to", async (port, secure, expectedSecure) => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_PORT", port);
    vi.stubEnv("SMTP_SECURE", secure);
    vi.stubEnv("CONTACT_TO_EMAIL", "events@example.com");
    const response = await POST(new Request("https://www.leaningoakranch.com/api/inquiry/", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(200);
    expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: "smtp.example.com", port: Number(port), secure: expectedSecure, requireTLS: !expectedSecure,
      auth: { user: "smtp-user", pass: "smtp-password" },
    }));
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: "Leaning Oak Ranch <inquiries@leaningoakranch.com>",
      to: "events@example.com", replyTo: payload.email,
      text: expect.stringContaining(payload.message),
    }));
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it.each([
    ["SMTP_PASS", ""], ["SMTP_FROM_EMAIL", ""], ["SMTP_PORT", "invalid"],
    ["SMTP_PORT", "0"], ["SMTP_SECURE", "not-a-boolean"],
  ])("rejects invalid SMTP configuration for %s", async (key, value) => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv(key, value);
    const response = await POST(new Request("https://www.leaningoakranch.com/api/inquiry/", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(502);
    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("reports SMTP delivery failure without retrying via Resend", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    mocks.sendMail.mockRejectedValue(new Error("SMTP unavailable"));
    const response = await POST(new Request("https://www.leaningoakranch.com/api/inquiry/", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: "delivery_error" });
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not report success when SMTP rejects the recipient", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    mocks.sendMail.mockResolvedValue({ accepted: [], rejected: ["barbara@leaningoakranch.com"] });
    const response = await POST(new Request("https://www.leaningoakranch.com/api/inquiry/", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(502);
  });
});
