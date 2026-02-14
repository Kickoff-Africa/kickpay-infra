import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createTransferSchema } from "@/lib/validations/transfer";
import { toApiErrorResponse } from "@/lib/errors/api-error";

function generatePaymentReference(): string {
  const prefix = "KP";
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${time}-${rand}`;
}

/** GET: List transfers for the current user. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const client = prisma as unknown as {
    transfer?: {
      findMany: (args: unknown) => Promise<
        Array<{
          id: string;
          amountNgn: number;
          amountGbp: string | null;
          fxRate: string | null;
          status: string;
          paymentReference: string;
          paystackReference: string | null;
          paidAt: Date | null;
          settledAt: Date | null;
          createdAt: Date;
          recipient: { id: string; fullName: string; currency: string };
        }>
      >;
    };
  };

  if (!client.transfer) {
    return NextResponse.json({ transfers: [] });
  }

  const where = status ? { userId: session.userId, status } : { userId: session.userId };
  const list = await client.transfer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { recipient: { select: { id: true, fullName: true, currency: true } } },
  });

  return NextResponse.json({
    transfers: list.map((t) => ({
      id: t.id,
      amountNgn: t.amountNgn,
      amountGbp: t.amountGbp,
      fxRate: t.fxRate,
      status: t.status,
      paymentReference: t.paymentReference,
      paystackReference: t.paystackReference,
      paidAt: t.paidAt?.toISOString() ?? null,
      settledAt: t.settledAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      recipient: t.recipient,
    })),
  });
}

/** POST: Create a transfer. Collects recipient + amount NGN, generates payment reference for user to pay into. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTransferSchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.flatten().fieldErrors;
      const msg = Object.values(err).flat().find(Boolean) ?? "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const client = prisma as unknown as {
      recipient?: {
        findFirst: (args: unknown) => Promise<{ id: string } | null>;
      };
      transfer?: {
        create: (args: unknown) => Promise<{
          id: string;
          amountNgn: number;
          status: string;
          paymentReference: string;
          createdAt: Date;
          recipientId: string;
        }>;
      };
    };

    if (!client.recipient || !client.transfer) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const recipient = await client.recipient.findFirst({
      where: { id: parsed.data.recipientId, userId: session.userId },
    });
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const paymentReference = generatePaymentReference();
    const transfer = await client.transfer.create({
      data: {
        userId: session.userId,
        recipientId: parsed.data.recipientId,
        amountNgn: parsed.data.amountNgn,
        status: "pending_payment",
        paymentReference,
      },
    });

    return NextResponse.json(
      {
        id: transfer.id,
        amountNgn: transfer.amountNgn,
        status: transfer.status,
        paymentReference: transfer.paymentReference,
        message: "Pay NGN into the account/link generated via the payment endpoint using this payment reference.",
        createdAt: transfer.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create transfer error:", e);
    return toApiErrorResponse(e);
  }
}
