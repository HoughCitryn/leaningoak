import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processInquiry, type InquiryDependencies } from "@/lib/inquiry";

const recipient = "barbara@leaningoakranch.com";

export function createInquiryDependencies(): InquiryDependencies {
  return {
    async verifyTurnstile(token, remoteIp) {
      const secret = process.env.TURNSTILE_SECRET_KEY;
      if (!secret) return false;

      const body = new URLSearchParams({ secret, response: token });
      if (remoteIp) body.set("remoteip", remoteIp);
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
        cache: "no-store",
      });
      if (!response.ok) return false;
      const result = (await response.json()) as { success?: boolean };
      return result.success === true;
    },
    async deliver(payload) {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL;
      if (!apiKey || !from) return false;

      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: recipient,
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
      });
      return !error;
    },
  };
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => undefined);
  const forwarded = request.headers.get("x-forwarded-for");
  const remoteIp = forwarded?.split(",")[0]?.trim();
  const result = await processInquiry(input, createInquiryDependencies(), remoteIp);

  const status = result.status === "success" ? 200 : result.status === "validation_error" ? 400 : result.status === "spam_rejected" ? 403 : 502;
  return NextResponse.json(result, { status });
}
