"use client";

import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-[var(--primary)] p-10 sm:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--primary-foreground)] tracking-tight">
              Ready to move money across borders?
            </h2>
            <p className="mt-4 text-lg text-[var(--primary-foreground)]/90 max-w-xl mx-auto">
              Get API keys in minutes. Start with test mode, complete verification, then go live.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold bg-white text-[var(--primary)] hover:bg-white/95 transition-all h-12 px-8"
              >
                Get API keys
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl text-base font-medium text-[var(--primary-foreground)]/90 hover:text-[var(--primary-foreground)] border-2 border-white/50 hover:border-white transition-colors h-12 px-8"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
