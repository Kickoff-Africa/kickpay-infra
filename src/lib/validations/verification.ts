import { z } from "zod";

/** BVN: Nigeria Bank Verification Number is 11 digits. */
export const bvnSchema = z
  .string()
  .min(11, "BVN must be 11 digits")
  .max(11, "BVN must be 11 digits")
  .regex(/^\d+$/, "BVN must contain only numbers");

/** TIN: Tax Identification Number - allow alphanumeric, common lengths. */
export const tinSchema = z
  .string()
  .min(1, "TIN is required")
  .max(50, "TIN is too long");

export const verificationSubmitSchema = z.object({
  bvn: bvnSchema,
  tin: tinSchema,
  countryCode: z
    .string()
    .min(2, "Country is required")
    .max(2, "Country code must be 2 letters")
    .regex(/^[A-Za-z]{2}$/, "Use 2-letter country code, e.g. NG"),
  currency: z
    .string()
    .min(1, "Currency is required")
    .max(10, "Currency code is too long"),
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(200, "Business name is too long"),
  phone: z
    .string()
    .min(5, "Phone number is required")
    .max(30, "Phone number is too long"),
  businessPhone: z
    .string()
    .max(30, "Business phone number is too long")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;
