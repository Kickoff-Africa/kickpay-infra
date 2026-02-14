"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  bvn: string;
  tin: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
};

export function VerificationList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  function load() {
    setError(null);
    fetch("/api/admin/verification", { credentials: "include" })
      .then((res) => {
        if (res.status === 403) throw new Error("Forbidden");
        return res.json();
      })
      .then((data: { submissions?: Submission[] }) => {
        setSubmissions(data.submissions ?? []);
      })
      .catch((e) => {
        setError(e.message ?? "Failed to load");
        setSubmissions([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);

  async function approve(id: string) {
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/verification/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.error ?? "Failed");
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActioning(null);
    }
  }

  async function reject(id: string) {
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/verification/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: rejectReason[id] || undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.error ?? "Failed");
      }
      setRejectReason((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActioning(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Verification</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Review and approve or reject verification submissions. Approved users receive live API keys.
      </p>

      {error && (
        <p className="text-sm text-[var(--error)] mb-4">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pending ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No pending submissions.</p>
          ) : (
            <ul className="space-y-4">
              {pending.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-[var(--border)] p-4"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {s.displayName || s.email}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">{s.email}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      BVN: ***{s.bvn.slice(-4)} · TIN: {s.tin} · Submitted {new Date(s.submittedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectReason[s.id] ?? ""}
                        onChange={(e) =>
                          setRejectReason((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                        className="max-w-xs rounded border border-[var(--input)] bg-transparent px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => reject(s.id)}
                      disabled={actioning !== null}
                    >
                      {actioning === s.id ? "Rejecting…" : "Reject"}
                    </Button>
                    <Button
                      onClick={() => approve(s.id)}
                      disabled={actioning !== null}
                    >
                      {actioning === s.id ? "Approving…" : "Approve"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {submissions.filter((s) => s.status !== "pending").length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Recent (approved/rejected)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {submissions
                .filter((s) => s.status !== "pending")
                .slice(0, 10)
                .map((s) => (
                  <li key={s.id} className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">{s.email}</span>
                    <span
                      className={
                        s.status === "approved"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
