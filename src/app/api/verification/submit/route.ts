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
    const cacDocument = formData.get("cacDocument");
    const additionalDocuments = formData.getAll("additionalDocuments").filter((f): f is File => f instanceof File);

    const parsed = verificationSubmitSchema.safeParse({ bvn: String(bvn ?? "").trim(), tin: String(tin ?? "").trim() });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first = [msg.bvn?.[0], msg.tin?.[0]].find(Boolean);
      return NextResponse.json({ error: first ?? "Invalid BVN or TIN" }, { status: 400 });
    }

    if (!cacDocument || !(cacDocument instanceof File) || cacDocument.size === 0) {
      return NextResponse.json({ error: "CAC document is required" }, { status: 400 });
    }

    const userId = session.userId;
    const submissionId = randomBytes(8).toString("hex");

    const cacPath = await saveVerificationFile(userId, submissionId, cacDocument);
    const additionalPaths: string[] = [];
    for (const file of additionalDocuments) {
      if (file.size === 0) continue;
      const p = await saveVerificationFile(userId, submissionId, file);
      additionalPaths.push(p);
    }

    const prismaClient = prisma as unknown as {
      verificationSubmission?: {
        create: (args: unknown) => Promise<{ id: string }>;
      };
    };
    if (!prismaClient.verificationSubmission) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
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
