import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

/**
 * GET: List users with optional filters. Returns stats (total, active, inactive) and paginated list.
 * Query: role, status (pending|verified|suspended), page, limit.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get("role");
  const statusFilter = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const client = prisma as unknown as {
    user?: {
      count: (args: unknown) => Promise<number>;
      findMany: (args: unknown) => Promise<
        Array<{
          id: string;
          email: string;
          displayName: string | null;
          accountStatus: string;
          role: string;
          createdAt: Date;
        }>
      >;
    };
  };

  if (!client.user) {
    return NextResponse.json({ stats: { total: 0, active: 0, inactive: 0 }, users: [], total: 0 });
  }

  const baseWhere = (() => {
    const w: { role?: string; accountStatus?: string } = {};
    if (roleFilter) w.role = roleFilter;
    if (statusFilter) w.accountStatus = statusFilter;
    return w;
  })();

  const [total, activeCount, inactiveCount, users] = await Promise.all([
    client.user.count({ where: baseWhere }),
    client.user.count({
      where: { ...baseWhere, accountStatus: { not: "suspended" } },
    }),
    client.user.count({
      where: { ...baseWhere, accountStatus: "suspended" },
    }),
    client.user.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        email: true,
        displayName: true,
        accountStatus: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = {
    total,
    active: activeCount,
    inactive: inactiveCount,
  };

  return NextResponse.json({
    stats,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName ?? undefined,
      accountStatus: u.accountStatus,
      role: u.role,
      createdAt: u.createdAt,
    })),
    total,
  });
}
