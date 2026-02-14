import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "node:crypto";

/**
 * POST: Paystack webhook. Verify signature and on charge.success update transfer:
 * - Set status to payment_received
 * - Set paystackReference, paidAt
 * - Convert NGN → GBP (FX), set amountGbp, fxRate
 * - (Later: credit Haystack internal account; T+1 settlement via Liang Liang)
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET ?? process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody) as { event: string; data?: { reference?: string; status?: string } };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ received: true });
  }

  const transfer = await prisma.transfer.findUnique({
    where: { paymentReference: reference },
  });

  if (!transfer || transfer.status !== "pending_payment") {
    return NextResponse.json({ received: true });
  }

  const amountNgn = transfer.amountNgn / 100;
  const ngnPerGbp = 2500;
  const amountGbp = (amountNgn / ngnPerGbp).toFixed(4);
  const rate = (1 / ngnPerGbp).toFixed(6);

  await prisma.transfer.update({
    where: { id: transfer.id },
    data: {
      status: "payment_received",
      paystackReference: reference,
      paidAt: new Date(),
      amountGbp,
      fxRate: rate,
    },
  });

  return NextResponse.json({ received: true });
}
