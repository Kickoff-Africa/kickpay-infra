import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

/** GET: List verification submissions (pending first). Admin only. */
export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status"); // pending | approved | rejected

  const client = prisma as unknown as {
    verificationSubmission?: {
      findMany: (args: unknown) => Promise<
        Array<{
          id: string;
          userId: string;
          bvn: string;
          tin: string;
          status: string;
          submittedAt: Date;
          reviewedAt: Date | null;
          user: { email: string; displayName: string | null };
        }>
      >;
    };
  };

  if (!client.verificationSubmission) {
    return NextResponse.json({ submissions: [] });
  }

  const where = statusFilter ? { status: statusFilter } : {};
  const list = await client.verificationSubmission.findMany({
    where,
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    take: 100,
    include: {
      user: { select: { email: true, displayName: true } },
    },
  });

  const submissions = list.map((s) => ({
    id: s.id,
    userId: s.userId,
    email: s.user.email,
    displayName: s.user.displayName,
    bvn: s.bvn,
    tin: s.tin,
    status: s.status,
    submittedAt: s.submittedAt,
    reviewedAt: s.reviewedAt ?? undefined,
  }));

  return NextResponse.json({ submissions });
}
