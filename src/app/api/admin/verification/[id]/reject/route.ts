import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** POST: Reject verification. Body: { reason?: string }. Admin only. */
export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  let reason: string | undefined;
  try {
    const body = await request.json();
    reason = typeof body?.reason === "string" ? body.reason : undefined;
  } catch {
    // no body
  }

  const client = prisma as unknown as {
    verificationSubmission?: {
      findUnique: (args: unknown) => Promise<{ id: string; status: string } | null>;
      update: (args: unknown) => Promise<unknown>;
    };
  };

  if (!client.verificationSubmission) {
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

  await client.verificationSubmission.update({
    where: { id },
    data: { status: "rejected", rejectionReason: reason ?? null, reviewedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    message: "Verification rejected.",
  });
}
