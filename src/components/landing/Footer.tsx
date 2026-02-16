"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#products", label: "Products" },
  { href: "#about", label: "About" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--foreground)]">
              Kick<span className="text-[var(--primary)]">Pay</span>
            </span>
          </div>
          <nav className="flex flex-wrap gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)]">
          © {currentYear} KickPay. NGN–CNY payment infrastructure for businesses.
        </div>
      </div>
    </footer>
  );
}
