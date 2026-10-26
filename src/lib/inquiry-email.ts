import nodemailer from "nodemailer";
import { Resend } from "resend";
import { z } from "zod";
import { siteConfig } from "@/content/site";
import type { InquiryPayload } from "./inquiry";

const smtpComConfig = z.object({
  apiKey: z.string().trim().min(1),
  channel: z.string().trim().min(1),
  from: z.email(),
  to: z.email(),
});

// SMTP.com can return a structured ID or an acceptance message containing it.
const smtpComAcceptance = z.object({
  status: z.literal("success"),
  data: z.union([
    z.object({ msg_id: z.string().trim().min(1) }),
    z.object({ message: z.string().regex(/^accepted,\s*msg_id:\s*[a-zA-Z0-9][a-zA-Z0-9._-]*\s*$/i) }),
  ]),
});

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

  // SMTP_API is an HTTP API key, not an SMTP login password. Prefer the
  // API/channel configuration used by the existing Trends integration.
  if (process.env.SMTP_API?.trim() || process.env.SMTP_CHANNEL?.trim()) {
    const config = smtpComConfig.safeParse({
      apiKey: process.env.SMTP_API,
      channel: process.env.SMTP_CHANNEL,
      from: process.env.CONTACT_FROM_EMAIL?.trim(),
      to: message.to,
    });
    if (!config.success) return false;

    const response = await fetch("https://api.smtp.com/v4/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-SMTPCOM-API": config.data.apiKey,
      },
      body: JSON.stringify({
        channel: config.data.channel,
        recipients: { to: [{ address: config.data.to }] },
        originator: {
          from: { name: siteConfig.name, address: config.data.from },
          reply_to: { address: message.replyTo },
        },
        subject: message.subject,
        body: { parts: [{ type: "text/plain", charset: "UTF-8", content: message.text }] },
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return false;
    const result: unknown = await response.json().catch(() => null);
    return smtpComAcceptance.safeParse(result).success;
  }

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
