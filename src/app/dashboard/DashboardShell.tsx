"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Me = {
  id: string;
  email: string;
  displayName: string | null;
  accountStatus: string;
  role?: string;
  testSecretPrefix?: string;
  liveSecretPrefix?: string;
};

const mainNav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/keys", label: "API Keys" },
  { href: "/dashboard/docs", label: "Documentation" },
  { href: "/dashboard/verification", label: "Verification" },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Me | null) => {
        setMe(data);
        if (data?.role === "admin" || data?.role === "super_admin") {
          router.replace("/admin");
        }
      })
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Session expired. <Link href="/login" className="text-primary">Log in</Link> again.
        </p>
      </div>
    );
  }

  const isDocs = pathname.startsWith("/dashboard/docs");

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Main sidebar */}
      <aside
        className={cn(
          "border-r border-[var(--border)] bg-[var(--card)] flex flex-col transition-[width]",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-[var(--foreground)] truncate">
            {sidebarOpen ? "KickPay" : "K"}
          </Link>
          <Button
            variant="ghost"
            className="shrink-0 h-8 w-8 p-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "←" : "→"}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {mainNav.map((item) => {
            const active = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <span className="shrink-0 w-5 text-center">
                  {item.label === "Overview" ? "◉" : item.label === "Transactions" ? "↔" : item.label === "API Keys" ? "🔑" : item.label === "Documentation" ? "📄" : "✓"}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-[var(--border)]">
          <div className={cn("px-3 py-2 text-xs text-[var(--muted-foreground)]", !sidebarOpen && "truncate")}>
            {sidebarOpen ? me.email : me.email.slice(0, 1)}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <span className="shrink-0">⎋</span>
            {sidebarOpen && <span>Log out</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
