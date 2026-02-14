import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createRecipientSchema } from "@/lib/validations/recipient";
import { toApiErrorResponse } from "@/lib/errors/api-error";

/** GET: List recipients for the current user. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = prisma as unknown as {
    recipient?: {
      findMany: (args: unknown) => Promise<
        Array<{
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
        }>
      >;
    };
  };

  if (!client.recipient) {
    return NextResponse.json({ recipients: [] });
  }

  const list = await client.recipient.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      bankName: true,
      accountNumber: true,
      bankCode: true,
      currency: true,
      countryCode: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    recipients: list.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

/** POST: Create a recipient (person in China / destination). */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createRecipientSchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.flatten().fieldErrors;
      const msg = Object.values(err).flat().find(Boolean) ?? "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const client = prisma as unknown as {
      recipient?: {
        create: (args: unknown) => Promise<{
          id: string;
          fullName: string;
          accountNumber: string;
          currency: string;
          countryCode: string;
          createdAt: Date;
        }>;
      };
    };

    if (!client.recipient) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const data = parsed.data;
    const recipient = await client.recipient.create({
      data: {
        userId: session.userId,
        fullName: data.fullName,
        bankName: data.bankName ?? null,
        accountNumber: data.accountNumber,
        bankCode: data.bankCode ?? null,
        currency: data.currency,
        countryCode: data.countryCode,
        email: data.email || null,
        phone: data.phone ?? null,
      },
    });

    return NextResponse.json(
      {
        id: recipient.id,
        fullName: recipient.fullName,
        accountNumber: recipient.accountNumber,
        currency: recipient.currency,
        countryCode: recipient.countryCode,
        createdAt: recipient.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create recipient error:", e);
    return toApiErrorResponse(e);
  }
}
