import nextEnv from "@next/env";
import nodemailer from "nodemailer";
import { z } from "zod";

// Match Next.js production environment loading; never print credentials.
nextEnv.loadEnvConfig(process.cwd(), false);
const value = (name) => process.env[name]?.trim() ?? "";
const failures = [];
const required = (name) => {
  if (!value(name)) failures.push(`${name} is missing.`);
};

for (const name of ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"]) {
  required(name);
  if (/^[123]x0{10,}/.test(value(name))) failures.push(`${name} is a test key; use a production key.`);
}
if (!value("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION")) {
  console.log("NOTE: NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is empty. Confirm Search Console uses DNS verification before launch.");
}
const gaId = value("NEXT_PUBLIC_GA_MEASUREMENT_ID");
if (!gaId) failures.push("NEXT_PUBLIC_GA_MEASUREMENT_ID is missing.");
if (gaId && !/^G-[A-Z0-9]+$/.test(gaId)) failures.push("NEXT_PUBLIC_GA_MEASUREMENT_ID is not a GA4 measurement ID.");
console.log(gaId ? "Google Analytics: configured (requires visitor consent)." : "Google Analytics: disabled.");

if (value("SMTP_API") || value("SMTP_CHANNEL")) {
  const beforeApi = failures.length;
  for (const name of ["SMTP_API", "SMTP_CHANNEL", "CONTACT_FROM_EMAIL"]) required(name);
  if (value("CONTACT_FROM_EMAIL") && !z.email().safeParse(value("CONTACT_FROM_EMAIL")).success) {
    failures.push("CONTACT_FROM_EMAIL must be a valid email address.");
  }
  if (value("CONTACT_TO_EMAIL") && !z.email().safeParse(value("CONTACT_TO_EMAIL")).success) {
    failures.push("CONTACT_TO_EMAIL must be a valid email address.");
  }
  console.log("Email provider: SMTP.com HTTP API (SMTP_API + SMTP_CHANNEL).");
  // Keep --smtp compatible with earlier setup instructions; it now verifies
  // the configured transport, rather than attempting an unrelated SMTP login.
  if ((process.argv.includes("--email") || process.argv.includes("--smtp")) && failures.length === beforeApi) {
    try {
      const headers = { "X-SMTPCOM-API": value("SMTP_API"), Accept: "application/json" };
      const response = await fetch(`https://api.smtp.com/v4/channels/${encodeURIComponent(value("SMTP_CHANNEL"))}`, {
        headers, redirect: "error", signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.status !== "success" || result?.data?.name !== value("SMTP_CHANNEL") || result?.data?.status !== "active") {
        failures.push(`SMTP.com API/channel verification failed (HTTP ${response.status}). Confirm the API key and active channel name.`);
      } else {
        console.log("SMTP.com API authentication and active channel: PASS. No message sent.");
        const domain = value("CONTACT_FROM_EMAIL").split("@")[1];
        const domainResponse = await fetch(`https://api.smtp.com/v4/domains/${encodeURIComponent(domain)}`, {
          headers, redirect: "error", signal: AbortSignal.timeout(15_000),
        });
        const domainResult = await domainResponse.json().catch(() => null);
        if (domainResponse.ok && domainResult?.status === "success" && domainResult?.data?.enabled === true) {
          console.log("SMTP.com sender domain: enabled. Inbox delivery still requires a real send test.");
        } else {
          console.log("NOTE: Sender domain is not confirmed enabled by the domain API. Verify the sending domain or individual address in SMTP.com before live delivery.");
        }
      }
    } catch {
      failures.push("SMTP.com API verification could not complete. Check network access and retry.");
    }
  }
} else if (value("SMTP_HOST")) {
  const beforeSmtp = failures.length;
  for (const name of ["SMTP_USER", "SMTP_FROM_EMAIL"]) required(name);
  required("SMTP_PASS");
  const port = Number(value("SMTP_PORT") || 587);
  const setting = value("SMTP_SECURE");
  if (!Number.isInteger(port) || port < 1 || port > 65535) failures.push("SMTP_PORT must be a valid port number.");
  if (setting && !["true", "false"].includes(setting)) failures.push("SMTP_SECURE must be true or false.");

  if ((process.argv.includes("--email") || process.argv.includes("--smtp")) && failures.length === beforeSmtp) {
    const secure = setting ? setting === "true" : port === 465;
    const transport = nodemailer.createTransport({
      host: value("SMTP_HOST"), port, secure, requireTLS: !secure,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
    });
    try {
      await transport.verify();
      console.log("SMTP connection, TLS, and authentication: PASS. No message sent.");
    } catch (error) {
      const code = /^[A-Z_]+$/.test(error.code) ? error.code : "SMTP_ERROR";
      const status = Number.isInteger(error.responseCode) ? `, server status ${error.responseCode}` : "";
      failures.push(`SMTP verification failed: ${code}${status}. Check provider credentials and sender authorization.`);
    } finally {
      transport.close();
    }
  }
} else if (!value("RESEND_API_KEY")) {
  failures.push("Configure SMTP_API + SMTP_CHANNEL + CONTACT_FROM_EMAIL, SMTP_HOST and credentials, or RESEND_API_KEY.");
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Required launch configuration is present. Validate the inquiry form and Search Console on the deployed domain.");
}
