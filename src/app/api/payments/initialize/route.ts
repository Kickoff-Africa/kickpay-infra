import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toApiErrorResponse } from "@/lib/errors/api-error";

/**
 * POST: Initialize NGN payment for a transfer (Paystack).
 * Body: { transferId } or { paymentReference }.
 * Returns: { authorizationUrl, reference } so user can pay NGN.
 * On success, Paystack webhook (or poll) should update transfer status and credit Haystack (GBP).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const transferId = body.transferId ?? body.paymentReference;
    if (!transferId || typeof transferId !== "string") {
      return NextResponse.json(
        { error: "transferId or paymentReference is required" },
        { status: 400 }
      );
    }

    const client = prisma as unknown as {
      transfer?: {
        findFirst: (args: unknown) => Promise<{
          id: string;
          amountNgn: number;
          paymentReference: string;
          status: string;
        } | null>;
      };
    };

    if (!client.transfer) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const transfer = await client.transfer.findFirst({
      where: {
        userId: session.userId,
        OR: [{ id: transferId }, { paymentReference: transferId }],
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    if (transfer.status !== "pending_payment") {
      return NextResponse.json(
        { error: `Transfer is not pending payment (status: ${transfer.status})` },
        { status: 400 }
      );
    }

    const amountNgn = transfer.amountNgn / 100; // kobo → NGN for Paystack (they use amount in Naira * 100 for kobo)
    const reference = transfer.paymentReference;

    // TODO: Call Paystack API to initialize transaction.
    // const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: session.email,
    //     amount: transfer.amountNgn, // in kobo
    //     reference,
    //     callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transfers/${transfer.id}/callback`,
    //     metadata: { transferId: transfer.id },
    //   }),
    // });
    // const data = await paystackRes.json();
    // if (!data.status) return NextResponse.json({ error: data.message ?? 'Paystack error' }, 400);
    // return NextResponse.json({ authorizationUrl: data.data.authorization_url, reference: data.data.reference });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const placeholderUrl = `${baseUrl}/dashboard/transfers?pay=${reference}`;

    return NextResponse.json({
      authorizationUrl: placeholderUrl,
      reference,
      transferId: transfer.id,
      amountNgn: transfer.amountNgn,
      message: "Integrate Paystack: use PAYSTACK_SECRET_KEY and call transaction/initialize. User should be redirected to authorizationUrl to pay NGN.",
    });
  } catch (e) {
    console.error("Initialize payment error:", e);
    return toApiErrorResponse(e);
  }
}
