import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type MeUserShape = {
  id: string;
  email: string;
  displayName: string | null;
  accountStatus: string;
  role: string | null;
  testSecretPrefix: string | null;
  liveSecretPrefix: string | null;
  phone: string | null;
  businessPhone: string | null;
  countryCode: string | null;
  defaultCurrency: string | null;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userDelegate = (prisma as unknown as {
    user?: { findUnique: (args: unknown) => Promise<MeUserShape | null> };
  }).user;
  if (!userDelegate) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const user = await userDelegate.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isVerified = user.accountStatus === "verified";
  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName ?? undefined,
    accountStatus: user.accountStatus,
    role: user.role ?? "user",
    testSecretPrefix: user.testSecretPrefix ?? undefined,
    liveSecretPrefix: isVerified ? (user.liveSecretPrefix ?? undefined) : undefined,
    phone: user.phone ?? undefined,
    businessPhone: user.businessPhone ?? undefined,
    countryCode: user.countryCode ?? undefined,
    defaultCurrency: user.defaultCurrency ?? undefined,
  });
}
