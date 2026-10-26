import { z } from "zod";
import { eventTypes, type InquiryResult } from "@/content/types";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(30),
  eventType: z.enum(eventTypes, { message: "Please select an event type." }),
  preferredDate: optionalText.refine(
    (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Please enter a valid date.",
  ),
  guestCount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : Number(value)))
    .refine(
      (value) => value === undefined || (Number.isInteger(value) && value >= 1 && value <= 150),
      "Guest count must be between 1 and 150.",
    ),
  message: z.string().trim().min(10, "Please tell us a little about your event.").max(5000),
  turnstileToken: z.string().trim().min(1, "Please complete the security check.").max(2048),
  website: optionalText,
});

export type InquiryPayload = z.infer<typeof inquirySchema>;

export type InquiryDependencies = {
  verifyTurnstile: (token: string, remoteIp?: string) => Promise<boolean>;
  deliver: (payload: InquiryPayload) => Promise<boolean>;
};

export async function processInquiry(
  input: unknown,
  deps: InquiryDependencies,
  remoteIp?: string,
): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "validation_error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  if (parsed.data.website) return { status: "spam_rejected" };

  try {
    const human = await deps.verifyTurnstile(parsed.data.turnstileToken, remoteIp);
    if (!human) return { status: "spam_rejected" };

    const delivered = await deps.deliver(parsed.data);
    return delivered ? { status: "success" } : { status: "delivery_error" };
  } catch {
    return { status: "delivery_error" };
  }
}
