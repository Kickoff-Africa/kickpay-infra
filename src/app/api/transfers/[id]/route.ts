import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** GET: Fetch one transfer. */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const client = prisma as unknown as {
    transfer?: {
      findFirst: (args: unknown) => Promise<{
        id: string;
        amountNgn: number;
        amountGbp: string | null;
        fxRate: string | null;
        status: string;
        paymentReference: string;
        paystackReference: string | null;
        paidAt: Date | null;
        settledAt: Date | null;
        failureReason: string | null;
        createdAt: Date;
        recipient: {
          id: string;
          fullName: string;
          accountNumber: string;
          currency: string;
          countryCode: string;
        };
      } | null>;
    };
  };

  if (!client.transfer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const transfer = await client.transfer.findFirst({
    where: { id, userId: session.userId },
    include: {
      recipient: {
        select: { id: true, fullName: true, accountNumber: true, currency: true, countryCode: true },
      },
    },
  });

  if (!transfer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...transfer,
    paidAt: transfer.paidAt?.toISOString() ?? null,
    settledAt: transfer.settledAt?.toISOString() ?? null,
    createdAt: transfer.createdAt.toISOString(),
  });
}
