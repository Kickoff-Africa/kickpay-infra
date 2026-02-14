"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  accountStatus: string;
  createdAt: string;
};

export function AdminsPageClient() {
  const [stats, setStats] = useState({ total: 0, superAdmin: 0, admin: 0 });
  const [admins, setAdmins] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  function load() {
    setError(null);
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => res.ok ? res.json() : { users: [] })
      .then((data: { users?: UserRow[] }) => {
        const list = (data.users ?? []).filter(
          (u: UserRow) => u.role === "admin" || u.role === "super_admin"
        );
        setAdmins(
          list.map((u) => ({
            ...u,
            createdAt: typeof u.createdAt === "string" ? u.createdAt : (u as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? "",
          }))
        );
        const superAdmin = list.filter((u: UserRow) => u.role === "super_admin").length;
        setStats({
          total: list.length,
          superAdmin,
          admin: list.length - superAdmin,
        });
      })
      .catch(() => {
        setError("Failed to load");
        setAdmins([]);
        setStats({ total: 0, superAdmin: 0, admin: 0 });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(id: string, role: string) {
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
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

  async function removeAdminAccess(id: string) {
    if (!confirm("Remove admin access? This user will become a regular user.")) return;
    await setRole(id, "user");
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  const editUser = editId ? admins.find((u) => u.id === editId) : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Admin user management</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Invite and manage admins. Only super admins should invite or change roles.
      </p>

      {error && (
        <p className="text-sm text-[var(--error)] mb-4">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Super admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--primary)]">{stats.superAdmin}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.admin}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Admins</CardTitle>
          <Button variant="outline" disabled>
            Invite admin (coming soon)
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">
                      No admin users.
                    </td>
                  </tr>
                ) : (
                  admins.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">{u.displayName ?? "—"}</td>
                      <td className="p-4">
                        <span className={u.role === "super_admin" ? "text-[var(--primary)] font-medium" : ""}>
                          {u.role}
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
                            onClick={() => setEditId(editId === u.id ? null : u.id)}
                            disabled={actioning !== null}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 px-2 text-red-600"
                            onClick={() => removeAdminAccess(u.id)}
                            disabled={actioning !== null}
                          >
                            {actioning === u.id ? "…" : "Remove admin"}
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

      {editUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditId(null)}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Edit role</CardTitle>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditId(null)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">{editUser.email}</p>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Role</label>
                <select
                  defaultValue={editUser.role}
                  className="w-full rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 text-sm"
                  onChange={(e) => setRole(editUser.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
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
