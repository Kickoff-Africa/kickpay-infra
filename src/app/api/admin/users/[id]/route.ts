import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { toApiErrorResponse } from "@/lib/errors/api-error";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH: Update user (e.g. accountStatus for suspend/restore). Admin only. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  let body: { accountStatus?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const client = prisma as unknown as {
    user?: {
      findUnique: (args: unknown) => Promise<{ id: string; role: string } | null>;
      update: (args: unknown) => Promise<unknown>;
    };
  };

  if (!client.user) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const user = await client.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data: { accountStatus?: string; role?: string } = {};
  if (body.accountStatus !== undefined) {
    const valid = ["pending", "verified", "suspended"];
    if (!valid.includes(body.accountStatus)) {
      return NextResponse.json({ error: "Invalid accountStatus" }, { status: 400 });
    }
    data.accountStatus = body.accountStatus;
  }
  if (body.role !== undefined) {
    const valid = ["user", "admin", "super_admin"];
    if (!valid.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (user.id === admin.userId && body.role !== "super_admin" && body.role !== "admin") {
      return NextResponse.json({ error: "You cannot remove your own admin role" }, { status: 400 });
    }
    data.role = body.role;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  try {
    await client.user.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin user update error:", e);
    return toApiErrorResponse(e);
  }
}

/** DELETE: Delete user. Admin only. Cascades to verification submissions. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (id === admin.userId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const client = prisma as unknown as {
    user?: {
      findUnique: (args: unknown) => Promise<{ id: string } | null>;
      delete: (args: unknown) => Promise<unknown>;
    };
  };

  if (!client.user) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const user = await client.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await client.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin user delete error:", e);
    return toApiErrorResponse(e);
  }
}
