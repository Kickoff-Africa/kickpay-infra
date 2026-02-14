"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Transfer = {
  id: string;
  amountNgn: number;
  amountGbp: string | null;
  fxRate: string | null;
  status: string;
  paymentReference: string;
  paystackReference: string | null;
  paidAt: string | null;
  settledAt: string | null;
  createdAt: string;
  recipient: { id: string; fullName: string; currency: string };
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  payment_received: "Payment received",
  pending_settlement: "Pending settlement",
  completed: "Completed",
  failed: "Failed",
};

function formatNgn(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function TransactionsPageClient() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("limit", "50");
    fetch(`/api/transfers?${params.toString()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { transfers: [] }))
      .then((data: { transfers: Transfer[] }) => setTransfers(data.transfers ?? []))
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
        Transactions
      </h1>
      <p className="text-[var(--muted-foreground)] mb-6">
        View your NGN → China transfers. Use the API or Documentation for creating new transfers.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--muted-foreground)]">Filter:</span>
        <select
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
          ) : transfers.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No transfers yet. Create a recipient and a transfer from the{" "}
              <Link href="/dashboard/docs" className="text-[var(--primary)] underline">
                API docs
              </Link>{" "}
              or integrate with the transfer endpoints.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4 font-medium">Reference</th>
                    <th className="text-left py-2 pr-4 font-medium">Recipient</th>
                    <th className="text-right py-2 pr-4 font-medium">Amount (NGN)</th>
                    <th className="text-right py-2 pr-4 font-medium">Amount (GBP)</th>
                    <th className="text-left py-2 pr-4 font-medium">Status</th>
                    <th className="text-left py-2 pr-4 font-medium">Created</th>
                    <th className="text-left py-2 font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4 font-mono text-xs">{t.paymentReference}</td>
                      <td className="py-3 pr-4">{t.recipient.fullName}</td>
                      <td className="py-3 pr-4 text-right">{formatNgn(t.amountNgn)}</td>
                      <td className="py-3 pr-4 text-right">{t.amountGbp ?? "—"}</td>
                      <td className="py-3 pr-4">{STATUS_LABELS[t.status] ?? t.status}</td>
                      <td className="py-3 pr-4 text-[var(--muted-foreground)]">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="py-3 text-[var(--muted-foreground)]">
                        {t.paidAt ? formatDate(t.paidAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        <Link href="/dashboard/docs" className="text-[var(--primary)] hover:underline">
          Documentation
        </Link>{" "}
        includes List transfers, Create transfer, and Initialize payment.
      </p>
    </div>
  );
}
