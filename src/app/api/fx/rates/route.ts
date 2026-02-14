import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/**
 * GET: NGN to GBP rate (for display).
 * Replace with real FX engine / Haystack rate feed.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Placeholder: replace with call to FX engine / Haystack.
  const ngnPerGbp = 2500; // 1 GBP = 2500 NGN (example)
  const gbpPerNgn = 1 / ngnPerGbp;

  return NextResponse.json({
    from: "NGN",
    to: "GBP",
    rate: gbpPerNgn,
    inverseRate: ngnPerGbp,
    source: "kickpay-fx",
    updatedAt: new Date().toISOString(),
  });
}
