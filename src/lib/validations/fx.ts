import { z } from "zod";

export const fxQuoteSchema = z.object({
  amountNgn: z.number().int().positive("Amount must be positive (in kobo)"),
});

export type FxQuoteInput = z.infer<typeof fxQuoteSchema>;
