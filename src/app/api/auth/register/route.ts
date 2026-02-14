import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { toApiErrorResponse } from "@/lib/errors/api-error";
import { hashPassword } from "@/lib/auth/password";
import { generateTestSecret } from "@/lib/auth/keys";
import { encrypt } from "@/lib/auth/encrypt";
import { createSession, COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message =
        Object.values(first).flat().find(Boolean) ??
        "Invalid input. Check email and password.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    const userDelegate = (prisma as unknown as {
      user?: {
        findUnique: (args: unknown) => Promise<{ id: string } | null>;
        create: (args: unknown) => Promise<{ id: string; email: string }>;
      };
    }).user;
    if (!userDelegate) {
      return NextResponse.json(
        { error: "Service is not ready. Please try again later." },
        { status: 503 }
      );
    }

    const existing = await userDelegate.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const { secret: testSecret, prefix: testSecretPrefix, hash: testSecretHash } =
      generateTestSecret();
    const testSecretEncrypted = encrypt(testSecret);

    const user = await userDelegate.create({
      data: {
        accountType: "company",
        email,
        passwordHash,
        accountStatus: "pending",
        testSecretHash,
        testSecretPrefix,
        testSecretEncrypted,
      },
    });

    const token = await createSession({ userId: user.id, email: user.email });
    const res = NextResponse.json(
      { success: true, apiKey: testSecret },
      { status: 201 }
    );
    res.cookies.set(COOKIE_NAME, token, getSessionCookieOptions());

    return res;
  } catch (e) {
    console.error("Register API error:", e);
    return toApiErrorResponse(e);
  }
}
