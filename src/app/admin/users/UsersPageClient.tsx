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

export function UsersPageClient() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
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
      setViewId(null);
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

  const viewUser = viewId ? users.find((u) => u.id === viewId) : null;
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

      {viewUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewId(null)}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">User details</CardTitle>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setViewId(null)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-[var(--muted-foreground)]">Email:</span> {viewUser.email}</p>
              <p><span className="text-[var(--muted-foreground)]">Name:</span> {viewUser.displayName ?? "—"}</p>
              <p><span className="text-[var(--muted-foreground)]">Role:</span> {viewUser.role}</p>
              <p><span className="text-[var(--muted-foreground)]">Status:</span> {viewUser.accountStatus}</p>
              <p><span className="text-[var(--muted-foreground)]">Created:</span> {new Date(viewUser.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
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
