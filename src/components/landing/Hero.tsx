"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--info)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)] opacity-40 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        <p className="text-sm font-medium tracking-wide uppercase text-[var(--primary)]">
          B2B cross-border payments
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] tracking-tight leading-[1.1]">
          Pay in Naira.
          <br />
          <span className="text-[var(--primary)]">Settle in China.</span>
        </h1>
        <p className="text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
          API-first infrastructure for Nigerian businesses. Collect NGN from your customers, we handle FX and T+1 settlement to recipients in China—and beyond.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all h-12 px-8 shadow-lg shadow-[var(--primary)]/25"
          >
            Get API keys
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-xl text-base font-medium border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors h-12 px-8"
          >
            See how it works
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 pt-8 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-[var(--foreground)]">NGN</span>
            <span>→</span>
            <span className="font-semibold text-[var(--foreground)]">GBP</span>
            <span>→</span>
            <span className="font-semibold text-[var(--foreground)]">CNY</span>
          </span>
          <span className="text-[var(--border)]">|</span>
          <span>Test & live keys</span>
          <span className="text-[var(--border)]">|</span>
          <span>REST API</span>
        </div>
      </div>
    </section>
  );
}
