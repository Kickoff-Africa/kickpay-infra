"use client";

import Link from "next/link";

const products = [
  {
    title: "REST API",
    description: "Create recipients, initiate transfers, and initialize payments. Webhooks and idempotency supported.",
    cta: "View docs",
    href: "/dashboard/docs",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Dashboard",
    description: "Manage API keys, view transactions, add recipients, and track transfer status without code.",
    cta: "Go to dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: "Verification",
    description: "Submit BVN, TIN, and business documents. Get reviewed and unlock live API keys for production.",
    cta: "Learn more",
    href: "/dashboard/verification",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function Products() {
  return (
    <section id="products" className="py-24 sm:py-32 px-4 sm:px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
            Products that power your flow
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            API for developers, dashboard for operators, verification for going live.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.title}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-xl hover:shadow-[var(--primary)]/5"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-6 group-hover:bg-[var(--primary)]/20 transition-colors">
                {product.icon}
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                {product.title}
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6 leading-relaxed">
                {product.description}
              </p>
              <Link
                href={product.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                {product.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
