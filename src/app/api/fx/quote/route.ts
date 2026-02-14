import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { fxQuoteSchema } from "@/lib/validations/fx";

/**
 * POST: Get FX quote for amount in NGN → GBP.
 * Used before creating a transfer so user sees expected GBP (Haystack) amount.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = fxQuoteSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.amountNgn?.[0] ?? "Invalid amount";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const amountNgnKobo = parsed.data.amountNgn;
  const amountNgn = amountNgnKobo / 100; // kobo → NGN

  // Placeholder rate: replace with FX engine.
  const ngnPerGbp = 2500;
  const amountGbp = amountNgn / ngnPerGbp;
  const rate = 1 / ngnPerGbp;

  return NextResponse.json({
    amountNgn: amountNgnKobo,
    amountGbp: Math.round(amountGbp * 100) / 100,
    rate,
    expiresAt: new Date(Date.now() + 60 * 1000).toISOString(), // quote valid 1 min
  });
}
