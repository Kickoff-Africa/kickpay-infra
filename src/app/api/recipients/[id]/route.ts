import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** GET: Fetch one recipient. */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const client = prisma as unknown as {
    recipient?: {
      findFirst: (args: unknown) => Promise<{
        id: string;
        fullName: string;
        bankName: string | null;
        accountNumber: string;
        bankCode: string | null;
        currency: string;
        countryCode: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
      } | null>;
    };
  };

  if (!client.recipient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const recipient = await client.recipient.findFirst({
    where: { id, userId: session.userId },
  });

  if (!recipient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...recipient,
    createdAt: recipient.createdAt.toISOString(),
  });
}
