"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { eventTypes, type InquiryResult } from "@/content/types";
import { trackEvent } from "@/lib/analytics";
import { Turnstile } from "./turnstile";

const successMessage = "Thanks! Your inquiry has been sent. We’ll be in touch soon.";
const failureMessage = "Something went wrong. Please try again or call 661-345-5102.";

export function InquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [token, setToken] = useState("");
  const [challenge, setChallenge] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!result) return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? statusRef.current)?.focus();
  }, [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !siteKey || !token) return;
    submitting.current = true;
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
      turnstileToken: token,
    };

    try {
      const response = await fetch("/api/inquiry/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as InquiryResult;
      if (!response.ok && data.status === "success") throw new Error("Delivery failed");
      setResult(data);
      if (response.ok && data.status === "success") {
        formRef.current?.reset();
        trackEvent("generate_lead", { form_name: "venue_inquiry" });
      }
    } catch {
      setResult({ status: "delivery_error" });
    } finally {
      // Siteverify tokens are single-use, including after a delivery failure.
      setToken("");
      setChallenge((value) => value + 1);
      submitting.current = false;
      setBusy(false);
    }
  }

  const errors = result?.status === "validation_error" ? result.fieldErrors : {};

  return (
    <>
      <form ref={formRef} className="inquiry-form" onSubmit={submit} noValidate aria-busy={busy}>
        <div className="form-grid">
          <Field label="Name" name="name" required autoComplete="name" error={errors.name?.[0]} />
          <Field label="Email" name="email" required type="email" autoComplete="email" error={errors.email?.[0]} />
          <Field label="Phone" name="phone" required type="tel" autoComplete="tel" error={errors.phone?.[0]} />
          <label className="form-field">
            <span id="eventType-label">Event Type</span>
            <select name="eventType" required defaultValue="" aria-labelledby="eventType-label" aria-invalid={Boolean(errors.eventType)} aria-describedby={errors.eventType ? "eventType-error" : undefined}>
              <option value="" disabled>Select an event type</option>
              {eventTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            {errors.eventType?.[0] ? <small id="eventType-error" role="alert">{errors.eventType[0]}</small> : null}
          </label>
          <Field label="Preferred Date (optional)" name="preferredDate" type="date" error={errors.preferredDate?.[0]} />
          <Field label="Guest Count (optional)" name="guestCount" type="number" min="1" max="150" error={errors.guestCount?.[0]} />
        </div>

        <label className="form-field form-field-full">
          <span id="message-label">Event Message</span>
          <textarea name="message" required rows={7} aria-labelledby="message-label" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} />
          {errors.message?.[0] ? <small id="message-error" role="alert">{errors.message[0]}</small> : null}
        </label>

        <div className="honeypot" aria-hidden="true">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        {siteKey ? (
          <Turnstile key={challenge} siteKey={siteKey} onChange={setToken} />
        ) : (
          <p className="form-setup-note">Online inquiries are temporarily unavailable. Please call <a href="tel:+16613455102">661-345-5102</a> or email <a href="mailto:barbara@leaningoakranch.com">barbara@leaningoakranch.com</a>.</p>
        )}
        {errors.turnstileToken?.[0] ? <small role="alert">{errors.turnstileToken[0]}</small> : null}

        {siteKey && !token && !busy ? <p role="status">Please complete the security check before sending. If it does not load, refresh the page or call 661-345-5102.</p> : null}
        <button className="button button-solid submit-button" type="submit" disabled={busy || !siteKey || !token}>
          {busy ? "Sending..." : "Send Inquiry"}
        </button>

        {result ? (
          <p ref={statusRef} tabIndex={-1} className={`form-status ${result.status === "success" ? "success" : "error"}`} role="status">
            {result.status === "success" ? successMessage : result.status === "validation_error" ? "Please review the highlighted fields." : result.status === "spam_rejected" ? "The security check expired or failed. Please complete the new check and try again." : failureMessage}
          </p>
        ) : null}
      </form>
    </>
  );
}

function Field({ label, name, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  return (
    <label className="form-field">
      <span id={`${name}-label`}>{label}</span>
      <input name={name} aria-labelledby={`${name}-label`} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props} />
      {error ? <small id={`${name}-error`} role="alert">{error}</small> : null}
    </label>
  );
}
