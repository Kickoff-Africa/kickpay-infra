import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toApiErrorResponse } from "@/lib/errors/api-error";
import { onboardingCompleteSchema } from "@/lib/validations/onboarding";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingCompleteSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message =
        Object.values(first).flat().find(Boolean) ??
        "Invalid input. Check phone, business name, and country.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { phone, businessName, countryCode } = parsed.data;

    const userDelegate = (prisma as unknown as {
      user?: { update: (args: unknown) => Promise<unknown> };
    }).user;
    if (!userDelegate) {
      return NextResponse.json(
        { error: "Service is not ready. Please try again later." },
        { status: 503 }
      );
    }

    await userDelegate.update({
      where: { id: session.userId },
      data: { phone, displayName: businessName, countryCode },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Onboarding complete API error:", e);
    return toApiErrorResponse(e);
  }
}
