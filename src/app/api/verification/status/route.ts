import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = prisma as unknown as {
    verificationSubmission?: {
      findMany: (args: unknown) => Promise<
        Array<{
          id: string;
          status: string;
          rejectionReason: string | null;
          submittedAt: string;
          reviewedAt: string | null;
        }>
      >;
    };
  };

  if (!client.verificationSubmission) {
    return NextResponse.json({ submission: null });
  }

  const list = await client.verificationSubmission.findMany({
    where: { userId: session.userId },
    orderBy: { submittedAt: "desc" },
    take: 1,
    select: {
      id: true,
      status: true,
      rejectionReason: true,
      submittedAt: true,
      reviewedAt: true,
    },
  });

  const submission = list[0] ?? null;
  return NextResponse.json({
    submission: submission
      ? {
          id: submission.id,
          status: submission.status,
          rejectionReason: submission.rejectionReason ?? undefined,
          submittedAt: submission.submittedAt,
          reviewedAt: submission.reviewedAt ?? undefined,
        }
      : null,
  });
}
