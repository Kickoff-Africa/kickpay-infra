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
          bvn: string;
          tin: string;
          cacDocumentPath: string;
          additionalPaths: string;
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
      bvn: true,
      tin: true,
      cacDocumentPath: true,
      additionalPaths: true,
    },
  });

  const submission = list[0] ?? null;

  const submissionPayload = submission
    ? {
        id: submission.id,
        status: submission.status,
        rejectionReason: submission.rejectionReason ?? undefined,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt ?? undefined,
        bvn: submission.bvn,
        tin: submission.tin,
        cacDocumentUrl: submission.cacDocumentPath,
        additionalDocumentUrls: safeParseArray(submission.additionalPaths),
      }
    : null;

  return NextResponse.json({
    submission: submissionPayload,
  });
}

function safeParseArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
