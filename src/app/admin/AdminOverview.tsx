"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminOverview() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Admin overview</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Summary and quick access to admin tools.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              API usage, request volume, and performance metrics.
            </p>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              View analytics
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Approve accounts, flag malicious users, suspend or restore access.
            </p>
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              Manage users
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              View transactions, resolve disputes, initiate refunds.
            </p>
            <Link
              href="/admin/transactions"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              Manage transactions
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin user management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Invite other admins and manage admin/super_admin roles.
            </p>
            <Link
              href="/admin/admins"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              Manage admins
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Review verification submissions and approve or reject for live API keys.
            </p>
            <Link
              href="/admin/verification"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              Review verification
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
