import { z } from "zod";

/** Step 1: business details. */
export const onboardingStep1Schema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(30, "Phone number is too long"),
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(200, "Business name is too long"),
});

/** Step 2: country. */
export const onboardingStep2Schema = z.object({
  countryCode: z
    .string()
    .length(2, "Please select your country"),
});

/** Full onboarding complete payload – use on client (submit) and server (API). */
export const onboardingCompleteSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(30, "Phone number is too long")
    .transform((s) => s.trim()),
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(200, "Business name is too long")
    .transform((s) => s.trim()),
  countryCode: z
    .string()
    .length(2, "Please select your country")
    .transform((s) => s.toUpperCase()),
});

export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>;
