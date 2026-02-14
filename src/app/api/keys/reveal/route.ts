import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { decrypt } from "@/lib/auth/encrypt";
import { toApiErrorResponse } from "@/lib/errors/api-error";

/** GET: Reveal full API key for the current user. Query: type=test | type=live */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    if (type !== "test" && type !== "live") {
      return NextResponse.json({ error: "Invalid type. Use type=test or type=live" }, { status: 400 });
    }

    const client = prisma as unknown as {
      user?: {
        findUnique: (args: unknown) => Promise<{
          id: string;
          accountStatus: string;
          testSecretEncrypted: string | null;
          liveSecretEncrypted: string | null;
        } | null>;
      };
    };

    if (!client.user) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const user = await client.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        accountStatus: true,
        testSecretEncrypted: true,
        liveSecretEncrypted: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const encrypted = type === "test" ? user.testSecretEncrypted : user.liveSecretEncrypted;
    if (!encrypted) {
      return NextResponse.json(
        { error: type === "test" ? "No test key stored. Generate a new key first." : "No live key yet. Complete verification." },
        { status: 404 }
      );
    }

    if (type === "live" && user.accountStatus !== "verified") {
      return NextResponse.json({ error: "Live key not available" }, { status: 403 });
    }

    const key = decrypt(encrypted);
    return NextResponse.json({ key });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Invalid")) {
      return NextResponse.json({ error: "Key could not be decrypted" }, { status: 500 });
    }
    console.error("Keys reveal error:", e);
    return toApiErrorResponse(e);
  }
}
