import { NextResponse } from "next/server";
import { processInquiry, type InquiryDependencies } from "@/lib/inquiry";
import { deliverInquiry } from "@/lib/inquiry-email";

export const runtime = "nodejs";

function createInquiryDependencies(): InquiryDependencies {
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
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) return false;
      const result = (await response.json()) as { success?: boolean };
      return result.success === true;
    },
    deliver: deliverInquiry,
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
