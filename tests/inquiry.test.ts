import { describe, expect, it, vi } from "vitest";
import { inquirySchema, processInquiry } from "@/lib/inquiry";

const validInquiry = {
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "661-555-0102",
  eventType: "Ceremony & Reception" as const,
  preferredDate: "2027-05-22",
  guestCount: 120,
  message: "We would like to schedule a tour and discuss the deluxe package.",
  turnstileToken: "verified-token",
  website: "",
};

describe("inquirySchema", () => {
  it("accepts a complete valid inquiry", () => {
    expect(inquirySchema.safeParse(validInquiry).success).toBe(true);
  });

  it("accepts omitted optional fields", () => {
    const minimal = {
      name: validInquiry.name,
      email: validInquiry.email,
      phone: validInquiry.phone,
      eventType: validInquiry.eventType,
      message: validInquiry.message,
      turnstileToken: validInquiry.turnstileToken,
      website: validInquiry.website,
    };
    expect(inquirySchema.safeParse(minimal).success).toBe(true);
  });

  it.each([0, 151, 4.5])("rejects invalid guest count %s", (guestCount) => {
    expect(inquirySchema.safeParse({ ...validInquiry, guestCount }).success).toBe(false);
  });

  it("rejects invalid email and short message", () => {
    const result = inquirySchema.safeParse({ ...validInquiry, email: "bad", message: "short" });
    expect(result.success).toBe(false);
  });
});

describe("processInquiry", () => {
  it("returns success when verification and delivery pass", async () => {
    const deps = { verifyTurnstile: vi.fn().mockResolvedValue(true), deliver: vi.fn().mockResolvedValue(true) };
    await expect(processInquiry(validInquiry, deps)).resolves.toEqual({ status: "success" });
    expect(deps.deliver).toHaveBeenCalledOnce();
  });

  it("returns validation_error before external calls", async () => {
    const deps = { verifyTurnstile: vi.fn(), deliver: vi.fn() };
    const result = await processInquiry({ ...validInquiry, email: "invalid" }, deps);
    expect(result.status).toBe("validation_error");
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
  });

  it("rejects the honeypot", async () => {
    const deps = { verifyTurnstile: vi.fn(), deliver: vi.fn() };
    await expect(processInquiry({ ...validInquiry, website: "spam.example" }, deps)).resolves.toEqual({ status: "spam_rejected" });
  });

  it("rejects a failed Turnstile check", async () => {
    const deps = { verifyTurnstile: vi.fn().mockResolvedValue(false), deliver: vi.fn() };
    await expect(processInquiry(validInquiry, deps)).resolves.toEqual({ status: "spam_rejected" });
    expect(deps.deliver).not.toHaveBeenCalled();
  });

  it("returns delivery_error when email delivery fails", async () => {
    const deps = { verifyTurnstile: vi.fn().mockResolvedValue(true), deliver: vi.fn().mockResolvedValue(false) };
    await expect(processInquiry(validInquiry, deps)).resolves.toEqual({ status: "delivery_error" });
  });
});
