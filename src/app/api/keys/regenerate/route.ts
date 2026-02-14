import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { generateTestSecret } from "@/lib/auth/keys";
import { encrypt } from "@/lib/auth/encrypt";
import { toApiErrorResponse } from "@/lib/errors/api-error";

/** Regenerate test API key. Returns the new key once; old key is invalidated. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDelegate = (prisma as unknown as {
      user?: {
        findUnique: (args: unknown) => Promise<{ id: string } | null>;
        update: (args: unknown) => Promise<unknown>;
      };
    }).user;
    if (!userDelegate) {
      return NextResponse.json(
        { error: "Service is not ready. Please try again later." },
        { status: 503 }
      );
    }

    const { secret, prefix, hash } = generateTestSecret();
    const testSecretEncrypted = encrypt(secret);
    await userDelegate.update({
      where: { id: session.userId },
      data: { testSecretHash: hash, testSecretPrefix: prefix, testSecretEncrypted },
    });

    return NextResponse.json({ apiKey: secret }, { status: 200 });
  } catch (e) {
    console.error("Regenerate key API error:", e);
    return toApiErrorResponse(e);
  }
}
