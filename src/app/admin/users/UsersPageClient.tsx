"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  email: string;
  displayName?: string;
  accountStatus: string;
  role: string;
  createdAt: string;
};

type Stats = { total: number; active: number; inactive: number };

type FullUser = {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
  businessPhone?: string;
  countryCode?: string;
  defaultCurrency?: string;
  accountType: string;
  accountStatus: string;
  role: string;
  testSecretPrefix?: string;
  liveSecretPrefix?: string;
  createdAt: string;
  updatedAt: string;
  verificationSubmissionsCount: number;
  recipientsCount: number;
  transfersCount: number;
};

export function UsersPageClient() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<FullUser | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  function load() {
    setError(null);
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => {
        if (res.status === 403) throw new Error("Forbidden");
        return res.json();
      })
      .then((data: { stats?: Stats; users?: UserRow[] }) => {
        setStats(data.stats ?? { total: 0, active: 0, inactive: 0 });
        setUsers(
          (data.users ?? []).map((u) => ({
            ...u,
            createdAt: typeof u.createdAt === "string" ? u.createdAt : (u as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? "",
          }))
        );
      })
      .catch((e) => {
        setError(e.message ?? "Failed to load");
        setStats({ total: 0, active: 0, inactive: 0 });
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);

  function closeViewDrawer() {
    setViewId(null);
    setViewUser(null);
    setViewError(null);
  }

  useEffect(() => {
    if (!viewId) {
      setViewUser(null);
      setViewError(null);
      return;
    }
    setViewLoading(true);
    setViewError(null);
    fetch(`/api/admin/users/${viewId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("User not found");
          throw new Error("Failed to load user");
        }
        return res.json();
      })
      .then((data: FullUser) => {
        setViewUser({
          ...data,
          createdAt: typeof data.createdAt === "string" ? data.createdAt : (data as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? "",
          updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : (data as unknown as { updatedAt: Date }).updatedAt?.toISOString?.() ?? "",
        });
      })
      .catch((e) => setViewError(e instanceof Error ? e.message : "Failed to load user"))
      .finally(() => setViewLoading(false));
  }, [viewId]);

  async function updateStatus(id: string, accountStatus: string) {
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accountStatus }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.error ?? "Failed");
      }
      setEditId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActioning(null);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.error ?? "Failed");
      }
      closeViewDrawer();
      setEditId(null);
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

  const editUser = editId ? users.find((u) => u.id === editId) : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">User management</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Manage merchant accounts: view, edit, deactivate, or delete users.
      </p>

      {error && (
        <p className="text-sm text-[var(--error)] mb-4">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Inactive (suspended)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--muted-foreground)]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">{u.displayName ?? "—"}</td>
                      <td className="p-4">
                        <span className={u.role !== "user" ? "text-[var(--primary)]" : ""}>{u.role}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            u.accountStatus === "suspended"
                              ? "text-red-600 dark:text-red-400"
                              : u.accountStatus === "verified"
                                ? "text-green-600 dark:text-green-400"
                                : ""
                          }
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--muted-foreground)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => setViewId(viewId === u.id ? null : u.id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => setEditId(editId === u.id ? null : u.id)}
                            disabled={actioning !== null}
                          >
                            Edit
                          </Button>
                          {u.accountStatus === "suspended" ? (
                            <Button
                              variant="ghost"
                              className="h-8 px-2 text-green-600"
                              onClick={() => updateStatus(u.id, "pending")}
                              disabled={actioning !== null}
                            >
                              {actioning === u.id ? "…" : "Activate"}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              className="h-8 px-2 text-red-600"
                              onClick={() => updateStatus(u.id, "suspended")}
                              disabled={actioning !== null}
                            >
                              {actioning === u.id ? "…" : "Deactivate"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            className="h-8 px-2 text-red-600"
                            onClick={() => removeUser(u.id)}
                            disabled={actioning !== null}
                          >
                            {actioning === u.id ? "…" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Side drawer: view user details */}
      {viewId && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={closeViewDrawer}
            aria-hidden
          />
          <aside className="relative w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {viewUser?.displayName || viewUser?.email || "User details"}
                </p>
                {viewUser && (
                  <p className="text-xs text-muted-foreground">{viewUser.email}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeViewDrawer}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
              {viewLoading && (
                <p className="text-sm text-muted-foreground">Loading user…</p>
              )}
              {viewError && (
                <p className="text-sm text-error">{viewError}</p>
              )}

              {viewUser && !viewLoading && !viewError && (
                <>
                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Profile
                    </h2>
                    <div className="grid gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                        <p className="font-medium">{viewUser.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Business name</p>
                        <p>{viewUser.displayName ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Account type</p>
                        <p className="capitalize">{viewUser.accountType}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Contact
                    </h2>
                    <div className="grid gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                        <p>{viewUser.phone ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Business phone</p>
                        <p>{viewUser.businessPhone ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Country</p>
                        <p>{viewUser.countryCode ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Currency</p>
                        <p>{viewUser.defaultCurrency ?? "—"}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Account
                    </h2>
                    <div className="grid gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                        <p>
                          <span
                            className={
                              viewUser.accountStatus === "suspended"
                                ? "text-red-600 dark:text-red-400"
                                : viewUser.accountStatus === "verified"
                                  ? "text-green-600 dark:text-green-400"
                                  : ""
                            }
                          >
                            {viewUser.accountStatus}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Role</p>
                        <p className="capitalize">{viewUser.role.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Created</p>
                        <p>{new Date(viewUser.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Last updated</p>
                        <p>{new Date(viewUser.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      API keys
                    </h2>
                    <div className="grid gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Test key</p>
                        <p className="font-mono text-xs">{viewUser.testSecretPrefix ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Live key</p>
                        <p className="font-mono text-xs">{viewUser.liveSecretPrefix ?? "—"}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Activity
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-center">
                        <p className="text-lg font-semibold text-foreground">{viewUser.verificationSubmissionsCount}</p>
                        <p className="text-[11px] text-muted-foreground">Verification submissions</p>
                      </div>
                      <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-center">
                        <p className="text-lg font-semibold text-foreground">{viewUser.recipientsCount}</p>
                        <p className="text-[11px] text-muted-foreground">Recipients</p>
                      </div>
                      <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-center">
                        <p className="text-lg font-semibold text-foreground">{viewUser.transfersCount}</p>
                        <p className="text-[11px] text-muted-foreground">Transfers</p>
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      // size="sm"
                      onClick={() => {
                        setEditId(viewUser.id);
                        closeViewDrawer();
                      }}
                      disabled={actioning !== null}
                    >
                      Edit status
                    </Button>
                    {viewUser.accountStatus === "suspended" ? (
                      <Button
                        variant="outline"
                        // size="sm"
                        className="text-green-600"
                        onClick={() => updateStatus(viewUser.id, "pending")}
                        disabled={actioning !== null}
                      >
                        {actioning === viewUser.id ? "…" : "Activate"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        // size="sm"
                        className="text-red-600"
                        onClick={() => updateStatus(viewUser.id, "suspended")}
                        disabled={actioning !== null}
                      >
                        {actioning === viewUser.id ? "…" : "Deactivate"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      //  size="sm"
                      className="text-red-600"
                      onClick={() => removeUser(viewUser.id)}
                      disabled={actioning !== null}
                    >
                      {actioning === viewUser.id ? "…" : "Delete"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {editUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditId(null)}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Edit user</CardTitle>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditId(null)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">{editUser.email}</p>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Status</label>
                <select
                  defaultValue={editUser.accountStatus}
                  className="w-full rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 text-sm"
                  onChange={(e) => updateStatus(editUser.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <Button variant="outline" onClick={() => setEditId(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
