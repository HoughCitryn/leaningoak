import nodemailer from "nodemailer";
import { Resend } from "resend";
import { siteConfig } from "@/content/site";
import type { InquiryPayload } from "./inquiry";

export async function deliverInquiry(payload: InquiryPayload): Promise<boolean> {
  const message = {
    to: process.env.CONTACT_TO_EMAIL?.trim() || siteConfig.email,
    replyTo: payload.email,
    subject: `New ${payload.eventType} inquiry from ${payload.name}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Event type: ${payload.eventType}`,
      `Preferred date: ${payload.preferredDate ?? "Not provided"}`,
      `Guest count: ${payload.guestCount ?? "Not provided"}`,
      "",
      "Message:",
      payload.message,
    ].join("\n"),
  };

  const host = process.env.SMTP_HOST?.trim();
  if (host) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secureSetting = process.env.SMTP_SECURE;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM_EMAIL;

    if (
      !user || !pass || !from ||
      !Number.isInteger(port) || port < 1 || port > 65535 ||
      (secureSetting !== undefined && secureSetting !== "true" && secureSetting !== "false")
    ) return false;

    const secure = secureSetting === undefined ? port === 465 : secureSetting === "true";
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: !secure,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    const result = await transport.sendMail({ from, ...message });
    return result.accepted.length > 0 && result.rejected.length === 0;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, ...message });
  return !error;
}
