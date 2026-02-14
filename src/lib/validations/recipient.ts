import { z } from "zod";

export const createRecipientSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  bankName: z.string().max(200).optional(),
  accountNumber: z.string().min(1, "Account number is required").max(50),
  bankCode: z.string().max(20).optional(),
  currency: z.string().length(3).default("CNY"),
  countryCode: z.string().length(2).default("CN"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
});

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
