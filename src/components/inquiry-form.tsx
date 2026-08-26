"use client";

import Script from "next/script";
import { useRef, useState, type FormEvent } from "react";
import { eventTypes, type InquiryResult } from "@/content/types";
import { trackEvent } from "@/lib/analytics";

const successMessage = "Thanks! Your inquiry has been sent. We’ll be in touch soon.";
const failureMessage = "Something went wrong. Please try again or call 661-345-5102.";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

export function InquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InquiryResult | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      eventType: formData.get("eventType"),
      preferredDate: formData.get("preferredDate"),
      guestCount: formData.get("guestCount"),
      message: formData.get("message"),
      website: formData.get("website"),
      turnstileToken: formData.get("cf-turnstile-response") ?? "",
    };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as InquiryResult;
      setResult(data);
      if (data.status === "success") {
        formRef.current?.reset();
        window.turnstile?.reset();
        trackEvent("generate_lead", { form_name: "venue_inquiry" });
      }
    } catch {
      setResult({ status: "delivery_error" });
    } finally {
      setBusy(false);
    }
  }

  const errors = result?.status === "validation_error" ? result.fieldErrors : {};

  return (
    <>
      {siteKey ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}
      <form ref={formRef} className="inquiry-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Name" name="name" autoComplete="name" error={errors.name?.[0]} />
          <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email?.[0]} />
          <Field label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone?.[0]} />
          <label className="form-field">
            <span>Event Type</span>
            <select name="eventType" defaultValue="" aria-invalid={Boolean(errors.eventType)}>
              <option value="" disabled>Select an event type</option>
              {eventTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            {errors.eventType?.[0] ? <small role="alert">{errors.eventType[0]}</small> : null}
          </label>
          <Field label="Preferred Date (optional)" name="preferredDate" type="date" error={errors.preferredDate?.[0]} />
          <Field label="Guest Count (optional)" name="guestCount" type="number" min="1" max="150" error={errors.guestCount?.[0]} />
        </div>

        <label className="form-field form-field-full">
          <span>Event Message</span>
          <textarea name="message" rows={7} aria-invalid={Boolean(errors.message)} />
          {errors.message?.[0] ? <small role="alert">{errors.message[0]}</small> : null}
        </label>

        <div className="honeypot" aria-hidden="true">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        {siteKey ? (
          <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
        ) : (
          <p className="form-setup-note">Security verification will be enabled when production keys are configured.</p>
        )}
        {errors.turnstileToken?.[0] ? <small role="alert">{errors.turnstileToken[0]}</small> : null}

        <button className="button button-solid submit-button" type="submit" disabled={busy || !siteKey}>
          {busy ? "Sending..." : "Send Inquiry"}
        </button>

        {result ? (
          <p className={`form-status ${result.status === "success" ? "success" : "error"}`} role="status">
            {result.status === "success" ? successMessage : result.status === "validation_error" ? "Please review the highlighted fields." : failureMessage}
          </p>
        ) : null}
      </form>
    </>
  );
}

function Field({ label, name, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input name={name} aria-invalid={Boolean(error)} {...props} />
      {error ? <small role="alert">{error}</small> : null}
    </label>
  );
}
