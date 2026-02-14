"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_ENDPOINTS } from "@/lib/docs/endpoints";
import { INTEGRATION_STACKS } from "@/lib/docs/integrations";
import { MethodBadge } from "@/components/docs/MethodBadge";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--card)] overflow-y-auto">
      <nav className="p-4 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            Getting started
          </h2>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/dashboard/docs"
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/dashboard/docs"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                Introduction
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            API Reference
          </h2>
          <ul className="space-y-0.5">
            {DOC_ENDPOINTS.map((ep) => {
              const href = `/dashboard/docs/endpoints/${ep.id}`;
              const active = pathname === href;
              return (
                <li key={ep.id}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <MethodBadge method={ep.method} className="mr-2 shrink-0" />
                    {ep.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            Integrations
          </h2>
          <ul className="space-y-0.5">
            {INTEGRATION_STACKS.map((stack) => {
              const href = `/dashboard/docs/integrations/${stack.id}`;
              const active = pathname === href;
              return (
                <li key={stack.id}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {stack.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
