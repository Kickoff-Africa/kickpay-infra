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
});

export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;
