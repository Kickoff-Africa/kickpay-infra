import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** GET: Fetch one verification submission. Admin only. */
export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const client = prisma as unknown as {
    verificationSubmission?: {
      findUnique: (args: unknown) => Promise<{
        id: string;
        userId: string;
        bvn: string;
        tin: string;
        cacDocumentPath: string;
        additionalPaths: string;
        status: string;
        rejectionReason: string | null;
        submittedAt: Date;
        reviewedAt: Date | null;
        user: { email: string; displayName: string | null };
      } | null>;
    };
  };

  if (!client.verificationSubmission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sub = await client.verificationSubmission.findUnique({
    where: { id },
    include: { user: { select: { email: true, displayName: true } } },
  });

  if (!sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: sub.id,
    userId: sub.userId,
    email: sub.user.email,
    displayName: sub.user.displayName,
    bvn: sub.bvn,
    tin: sub.tin,
    cacDocumentPath: sub.cacDocumentPath,
    additionalPaths: JSON.parse(sub.additionalPaths || "[]") as string[],
    status: sub.status,
    rejectionReason: sub.rejectionReason ?? undefined,
    submittedAt: sub.submittedAt,
    reviewedAt: sub.reviewedAt ?? undefined,
  });
}
