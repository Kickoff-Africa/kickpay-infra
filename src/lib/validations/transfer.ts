import { z } from "zod";

export const createTransferSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  amountNgn: z.number().int().positive("Amount must be positive (in kobo)"),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
