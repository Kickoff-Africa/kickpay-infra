"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Me = {
  id: string;
  email: string;
  role?: string;
};

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "User management" },
  { href: "/admin/transactions", label: "Transaction management" },
  { href: "/admin/admins", label: "Admin user management" },
  { href: "/admin/verification", label: "Verification" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
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
        const isAdmin = data?.role === "admin" || data?.role === "super_admin";
        if (data && !isAdmin) {
          router.replace("/dashboard");
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)]">
          Session expired. <Link href="/login" className="text-[var(--primary)]">Log in</Link> again.
        </p>
      </div>
    );
  }

  const isAdmin = me.role === "admin" || me.role === "super_admin";
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <aside
        className={cn(
          "border-r border-[var(--border)] bg-[var(--card)] flex flex-col transition-[width]",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/admin" className="font-bold text-[var(--foreground)] truncate">
            {sidebarOpen ? "KickPay Admin" : "A"}
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
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {adminNav.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
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
                  {item.label === "Overview" ? "◉" : item.label === "Analytics" ? "▣" : item.label === "User management" ? "👤" : item.label === "Transaction management" ? "↔" : item.label === "Admin user management" ? "⚙" : "✓"}
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
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <span className="shrink-0">⎋</span>
            {sidebarOpen && <span>Log out</span>}
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
