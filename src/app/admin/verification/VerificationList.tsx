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

type FullSubmission = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  bvn: string;
  tin: string;
  cacDocumentPath: string;
  additionalPaths: string[];
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
};

type ConfirmState =
  | { type: "approve"; id: string }
  | { type: "reject"; id: string; reason: string }
  | null;

export function VerificationList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<FullSubmission | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [drawerRejectReason, setDrawerRejectReason] = useState("");

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [actioning, setActioning] = useState(false);

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

  function closeDrawer() {
    setSelectedId(null);
    setSelected(null);
    setDrawerError(null);
    setDrawerRejectReason("");
  }

  async function openDrawer(id: string) {
    setSelectedId(id);
    setSelected(null);
    setDrawerError(null);
    setDrawerLoading(true);
    setDrawerRejectReason("");
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Failed to load submission");
      }
      const data = (await res.json()) as FullSubmission;
      setSelected({
        ...data,
        submittedAt: String(data.submittedAt),
        reviewedAt: data.reviewedAt ? String(data.reviewedAt) : undefined,
      });
      if (data.rejectionReason) {
        setDrawerRejectReason(data.rejectionReason);
      }
    } catch (e) {
      setDrawerError(e instanceof Error ? e.message : "Failed to load submission");
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/verification/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Failed to approve");
      }
      closeDrawer();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setActioning(false);
      setConfirm(null);
    }
  }

  async function handleReject(id: string, reason: string | undefined) {
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/verification/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Failed to reject");
      }
      closeDrawer();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject");
    } finally {
      setActioning(false);
      setConfirm(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-lg border border-border bg-card px-4 py-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading verification submissions…</p>
        </div>
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");
  const recent = submissions.filter((s) => s.status !== "pending");

  return (
    <>
      <div className="p-6 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
          Verification
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Review company details and documents before granting live API keys.
        </p>

        {error && <p className="text-sm text-error mb-4">{error}</p>}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Pending reviews</CardTitle>
            <span className="text-xs text-muted-foreground">
              {pending.length} {pending.length === 1 ? "submission" : "submissions"}
            </span>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending submissions.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card px-4 py-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {s.displayName || s.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                      <p className="text-[11px] text-muted-foreground">
                        BVN: ***{s.bvn.slice(-4)} · TIN: {s.tin} · Submitted{" "}
                        {new Date(s.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      // size="sm"
                      variant="outline"
                      className="ml-auto"
                      onClick={() => openDrawer(s.id)}
                    >
                      Review
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {recent.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base font-medium">Recent decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recent.slice(0, 10).map((s) => (
                  <li key={s.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-xs">
                      {s.displayName || s.email}
                    </span>
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

      {/* Side drawer for review */}
      {selectedId && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => {
              if (!actioning) closeDrawer();
            }}
          />
          <aside className="relative w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {selected?.displayName || selected?.email || "Verification review"}
                </p>
                {selected && (
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(selected.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={actioning}
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
              {drawerLoading && (
                <p className="text-sm text-muted-foreground">Loading submission…</p>
              )}

              {drawerError && (
                <p className="text-sm text-error">{drawerError}</p>
              )}

              {selected && !drawerLoading && !drawerError && (
                <>
                  <section className="space-y-1">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Business
                    </h2>
                    <p className="font-medium">
                      {selected.displayName || "(no business name)"}
                    </p>
                    <p className="text-xs text-muted-foreground">{selected.email}</p>
                  </section>

                  <section className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        BVN
                      </p>
                      <p className="font-mono text-sm">***{selected.bvn.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        TIN
                      </p>
                      <p>{selected.tin}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Status
                      </p>
                      <p className="capitalize">{selected.status}</p>
                    </div>
                    {selected.reviewedAt && (
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Reviewed at
                        </p>
                        <p>{new Date(selected.reviewedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </section>

                  <section className="space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Documents
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">CAC document</p>
                      {selected.cacDocumentPath ? (
                        <a
                          href={selected.cacDocumentPath}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View CAC document
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No CAC document attached.
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Other documents</p>
                      {selected.additionalPaths.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {selected.additionalPaths.map((url, idx) => (
                            <li key={url}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Document {idx + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No additional documents attached.
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Rejection reason (optional)
                    </label>
                    <textarea
                      className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      rows={3}
                      placeholder="Share a short explanation for rejecting this application."
                      value={drawerRejectReason}
                      onChange={(e) => setDrawerRejectReason(e.target.value)}
                      disabled={actioning}
                    />
                  </section>
                </>
              )}
            </div>

            <footer className="border-t border-border px-5 py-3 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                // size="sm"
                onClick={() =>
                  setConfirm({ type: "reject", id: selectedId, reason: drawerRejectReason })
                }
                disabled={actioning || drawerLoading || !selected}
              >
                Reject
              </Button>
              <Button
                type="button"
                // size="sm"
                onClick={() => setConfirm({ type: "approve", id: selectedId })}
                disabled={actioning || drawerLoading || !selected}
              >
                Approve
              </Button>
            </footer>
          </aside>
      </div>
      )}

      {/* Confirmation modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-lg">
            <h2 className="text-sm font-semibold text-foreground mb-2">
              {confirm.type === "approve" ? "Approve verification" : "Reject verification"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {confirm.type === "approve"
                ? "Are you sure you want to approve this verification and grant the user live API access?"
                : "Are you sure you want to reject this verification? The user will see the rejection status and any reason you provided."}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                // size="sm"
                onClick={() => setConfirm(null)}
                disabled={actioning}
              >
                Cancel
              </Button>
              {confirm.type === "approve" ? (
                <Button
                  type="button"
                  // size="sm"
                  onClick={() => handleApprove(confirm.id)}
                  disabled={actioning}
                >
                  {actioning ? "Approving…" : "Approve"}
                </Button>
              ) : (
                <Button
                  type="button"
                  // size="sm"
                  // variant="destructive"
                  onClick={() => handleReject(confirm.id, confirm.reason)}
                  disabled={actioning}
                >
                  {actioning ? "Rejecting…" : "Reject"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
