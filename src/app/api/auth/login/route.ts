import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth/session";
import { toApiErrorResponse } from "@/lib/errors/api-error";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }
    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    const userDelegate = (prisma as unknown as { user?: { findUnique: (args: unknown) => Promise<{ id: string; email: string; passwordHash: string; role: string } | null> } }).user;
    if (!userDelegate) {
      return NextResponse.json(
        { error: "Service is not ready. Please try again later." },
        { status: 503 }
      );
    }

    const user = await userDelegate.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createSession({ userId: user.id, email: user.email });
    const role = user.role ?? "user";
    const res = NextResponse.json({ success: true, role });
    res.cookies.set(COOKIE_NAME, token, getSessionCookieOptions());
    return res;
  } catch (e) {
    console.error("Login API error:", e);
    return toApiErrorResponse(e);
  }
}
