"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Me = {
  id: string;
  email: string;
  displayName: string | null;
  accountStatus: string;
  testSecretPrefix?: string;
  liveSecretPrefix?: string;
};

export function DashboardOverview() {
  const [me, setMe] = useState<Me | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = sessionStorage.getItem("kickpay_new_api_key");
      if (key) {
        setNewApiKey(key);
        sessionStorage.removeItem("kickpay_new_api_key");
      }
    }
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Me | null) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
  }

  if (!me) return null;

  const isVerified = me.accountStatus === "verified";

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
        Welcome back{me.displayName ? `, ${me.displayName}` : ""}
      </h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Manage your API keys, test endpoints, and complete verification to go live.
      </p>

      {newApiKey && (
        <Card className="mb-6 border-[var(--primary)]/50 bg-[var(--primary)]/5">
          <CardHeader>
            <CardTitle>Your API key (save it now)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-[var(--muted-foreground)]">
              Copy this key now. We won’t show it again. Use it in the{" "}
              <code className="text-xs bg-[var(--muted)] px-1 rounded">Authorization</code> header.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-[var(--muted)] px-3 py-2 text-sm font-mono">
                {newApiKey}
              </code>
              <Button type="button" variant="outline" onClick={() => copyKey(newApiKey)}>
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              View your NGN → China transfers, status, and payment history.
            </p>
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              View transactions
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {me.testSecretPrefix ? "Test key is set. " : "Get your test key. "}
              {isVerified ? "Live key available." : "Complete verification for live keys."}
            </p>
            <Link
              href="/dashboard/keys"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              Manage keys
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              API reference, try-it console, and integration guides for Node, PHP, Python, and more.
            </p>
            <Link
              href="/dashboard/docs"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              View docs
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {isVerified
                ? "Your account is verified. Live keys are active."
                : "Upload documents to get live API keys and process real payments."}
            </p>
            <Link
              href="/dashboard/verification"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
            >
              {isVerified ? "View status" : "Complete verification"}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
