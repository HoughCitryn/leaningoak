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
    vi.stubEnv("SMTP_API", "");
    vi.stubEnv("SMTP_CHANNEL", "");
    vi.stubEnv("CONTACT_FROM_EMAIL", "");
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

  function configureSmtpCom() {
    vi.stubEnv("SMTP_API", "smtpcom-api-key");
    vi.stubEnv("SMTP_CHANNEL", "ranch-channel");
    vi.stubEnv("CONTACT_FROM_EMAIL", "contactforms@citryn.com");
    // API settings must take precedence over leftover SMTP or Resend settings.
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
  }

  function inquiryRequest() {
    return new Request("https://www.leaningoakranch.com/api/inquiry/", {
      method: "POST", body: JSON.stringify(payload),
    });
  }

  it.each([
    { status: "success", data: { msg_id: "accepted-id" } },
    { status: "success", data: { message: "accepted, msg_id: 1234-abcd" } },
  ])("delivers through the SMTP.com API after CAPTCHA verification: %j", async (acceptance) => {
    configureSmtpCom();
    const api = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => acceptance });
    vi.stubGlobal("fetch", api);

    const response = await POST(inquiryRequest());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "success" });
    expect(api).toHaveBeenCalledTimes(2);
    expect(api.mock.calls[0][0]).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(api.mock.calls[1][0]).toBe("https://api.smtp.com/v4/messages");
    const request = api.mock.calls[1][1];
    expect(request).toMatchObject({
      method: "POST", redirect: "error",
      headers: { "X-SMTPCOM-API": "smtpcom-api-key", "Content-Type": "application/json" },
      signal: expect.any(AbortSignal),
    });
    expect(JSON.parse(request.body)).toMatchObject({
      channel: "ranch-channel",
      recipients: { to: [{ address: "barbara@leaningoakranch.com" }] },
      originator: {
        from: { name: "Leaning Oak Ranch", address: "contactforms@citryn.com" },
        reply_to: { address: payload.email },
      },
      subject: `New ${payload.eventType} inquiry from ${payload.name}`,
      body: { parts: [{ type: "text/plain", charset: "UTF-8", content: expect.stringContaining(payload.message) }] },
    });
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it.each([
    ["SMTP_API", ""], ["SMTP_CHANNEL", ""], ["CONTACT_FROM_EMAIL", ""],
    ["CONTACT_FROM_EMAIL", "not-an-email"], ["CONTACT_TO_EMAIL", "not-an-email"],
  ])("rejects incomplete API configuration without falling back: %s=%s", async (key, value) => {
    configureSmtpCom();
    vi.stubEnv(key, value);
    const response = await POST(inquiryRequest());
    expect(response.status).toBe(502);
    expect(fetch).toHaveBeenCalledOnce();
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it.each([
    { status: "fail", data: { message: "accepted, msg_id: id" } },
    { status: "success", data: { message: "accepted" } },
    { status: "success", data: { message: "accepted, msg_id: " } },
    { status: "success", data: { msg_id: " " } },
    null,
  ])("does not report API delivery without a valid acceptance ID: %j", async (result) => {
    configureSmtpCom();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => result }));
    const response = await POST(inquiryRequest());
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: "delivery_error" });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it.each(["http", "network", "invalid-json"])("handles API %s failures without retries or leaking provider errors", async (failure) => {
    configureSmtpCom();
    const api = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    if (failure === "network") api.mockRejectedValueOnce(new Error("private provider details"));
    else if (failure === "http") api.mockResolvedValueOnce({ ok: false, status: 403 });
    else api.mockResolvedValueOnce({ ok: true, json: async () => { throw new SyntaxError("invalid response"); } });
    vi.stubGlobal("fetch", api);
    const response = await POST(inquiryRequest());
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: "delivery_error" });
    expect(api).toHaveBeenCalledTimes(2);
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("never calls the SMTP.com API when the spam check fails", async () => {
    configureSmtpCom();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    const response = await POST(inquiryRequest());
    expect(response.status).toBe(403);
    expect(fetch).toHaveBeenCalledOnce();
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
