import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { generateLiveSecret } from "@/lib/auth/keys";
import { encrypt } from "@/lib/auth/encrypt";
import { toApiErrorResponse } from "@/lib/errors/api-error";

type RouteContext = { params: Promise<{ id: string }> };

/** POST: Approve verification → issue live API key and set user verified. Admin only. */
export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const client = prisma as unknown as {
    verificationSubmission?: {
      findUnique: (args: unknown) => Promise<{ id: string; userId: string; status: string } | null>;
      update: (args: unknown) => Promise<unknown>;
    };
    user?: {
      update: (args: unknown) => Promise<unknown>;
    };
  };

  if (!client.verificationSubmission || !client.user) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const sub = await client.verificationSubmission.findUnique({
    where: { id },
  });
  if (!sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (sub.status !== "pending") {
    return NextResponse.json({ error: "Submission is not pending" }, { status: 400 });
  }

  const { secret, prefix, hash } = generateLiveSecret();
  const liveSecretEncrypted = encrypt(secret);

  await client.user.update({
    where: { id: sub.userId },
    data: {
      accountStatus: "verified",
      liveSecretHash: hash,
      liveSecretPrefix: prefix,
      liveSecretEncrypted,
    },
  });

  await client.verificationSubmission.update({
    where: { id },
    data: { status: "approved", reviewedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    message: "Verification approved. User has been granted live API access.",
    liveKeyPrefix: prefix,
  });
}
