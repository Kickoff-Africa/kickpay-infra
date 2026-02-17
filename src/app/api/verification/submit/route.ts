import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { verificationSubmitSchema } from "@/lib/validations/verification";
import { saveVerificationFile } from "@/lib/upload";
import { toApiErrorResponse } from "@/lib/errors/api-error";
import { randomBytes } from "node:crypto";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const bvn = formData.get("bvn");
    const tin = formData.get("tin");
    const countryCode = formData.get("countryCode");
    const currency = formData.get("currency");
    const businessName = formData.get("businessName");
    const phone = formData.get("phone");
    const businessPhone = formData.get("businessPhone");
    const cacDocument = formData.get("cacDocument");
    const additionalDocuments = formData.getAll("additionalDocuments").filter((f): f is File => f instanceof File);

    const parsed = verificationSubmitSchema.safeParse({
      bvn: String(bvn ?? "").trim(),
      tin: String(tin ?? "").trim(),
      countryCode: String(countryCode ?? "").trim().toUpperCase(),
      currency: String(currency ?? "").trim().toUpperCase(),
      businessName: String(businessName ?? "").trim(),
      phone: String(phone ?? "").trim(),
      businessPhone: String(businessPhone ?? "").trim(),
    });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first =
        msg.bvn?.[0] ??
        msg.tin?.[0] ??
        msg.countryCode?.[0] ??
        msg.currency?.[0] ??
        msg.businessName?.[0] ??
        msg.phone?.[0] ??
        msg.businessPhone?.[0];
      return NextResponse.json({ error: first ?? "Invalid verification details" }, { status: 400 });
    }

    const userId = session.userId;
    const prismaClient = prisma as unknown as {
      verificationSubmission?: {
        create: (args: unknown) => Promise<{ id: string }>;
        findMany: (args: unknown) => Promise<
          Array<{
            id: string;
            cacDocumentPath: string;
            additionalPaths: string;
          }>
        >;
      };
      user?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    if (!prismaClient.verificationSubmission) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const existingList = await prismaClient.verificationSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      take: 1,
      select: {
        id: true,
        cacDocumentPath: true,
        additionalPaths: true,
      },
    });

    const existing = existingList[0] ?? null;

    if ((!cacDocument || !(cacDocument instanceof File) || cacDocument.size === 0) && !existing) {
      return NextResponse.json({ error: "CAC document is required" }, { status: 400 });
    }

    const submissionId = randomBytes(8).toString("hex");

    let cacPath: string;
    let additionalPaths: string[] = [];

    if (cacDocument && cacDocument instanceof File && cacDocument.size > 0) {
      cacPath = await saveVerificationFile(userId, submissionId, cacDocument);
      for (const file of additionalDocuments) {
        if (file.size === 0) continue;
        const p = await saveVerificationFile(userId, submissionId, file);
        additionalPaths.push(p);
      }
    } else if (existing) {
      cacPath = existing.cacDocumentPath;
      try {
        const parsed = JSON.parse(existing.additionalPaths);
        additionalPaths = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
      } catch {
        additionalPaths = [];
      }
    } else {
      // Fallback, though we should have already returned above if there is no existing and no file.
      return NextResponse.json({ error: "CAC document is required" }, { status: 400 });
    }

    // Keep the latest profile/business details in the user record as well.
    if (prismaClient.user) {
      await prismaClient.user.update({
        where: { id: userId },
        data: {
          phone: parsed.data.phone,
          businessPhone: parsed.data.businessPhone ?? null,
          displayName: parsed.data.businessName,
          countryCode: parsed.data.countryCode,
          defaultCurrency: parsed.data.currency,
        },
      });
    }

    await prismaClient.verificationSubmission.create({
      data: {
        userId,
        bvn: parsed.data.bvn,
        tin: parsed.data.tin,
        cacDocumentPath: cacPath,
        additionalPaths: JSON.stringify(additionalPaths),
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, message: "Verification submitted for review" }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message.includes("File")) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Verification submit error:", e);
    return toApiErrorResponse(e);
  }
}
