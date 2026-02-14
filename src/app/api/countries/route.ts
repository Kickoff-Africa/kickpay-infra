import { NextResponse } from "next/server";

export type CountryOption = { code: string; name: string };

const REST_COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca2";

export async function GET() {
  try {
    const res = await fetch(REST_COUNTRIES_URL, {
      next: { revalidate: 86400 }, // cache 24h
    });
    if (!res.ok) {
      throw new Error("Countries API failed");
    }
    const data = (await res.json()) as Array<{
      name: { common: string };
      cca2: string;
    }>;
    const countries: CountryOption[] = data
      .map((c) => ({ code: c.cca2, name: c.name.common }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(countries);
  } catch (e) {
    console.error("Countries fetch error:", e);
    return NextResponse.json(
      { error: "Failed to load countries" },
      { status: 502 }
    );
  }
}
