"use client";

export function About() {
  return (
    <section id="about" className="py-24 sm:py-32 px-4 sm:px-6 bg-[var(--muted)]/50 scroll-mt-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
          About KickPay
        </h2>
        <p className="mt-6 text-lg text-[var(--muted-foreground)] leading-relaxed">
          KickPay is the payment bridge between Nigeria and China for businesses. We enable you to collect Naira from your customers and settle in Chinese Yuan—or other supported currencies—with a simple API, clear pricing, and T+1 settlement. Built for platforms, marketplaces, and B2B use cases that need reliable cross-border rails.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
          <span className="inline-flex items-center gap-2 text-[var(--muted-foreground)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            API-first
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--muted-foreground)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            NGN → CNY
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--muted-foreground)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            T+1 settlement
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--muted-foreground)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            Test & live keys
          </span>
        </div>
      </div>
    </section>
  );
}
