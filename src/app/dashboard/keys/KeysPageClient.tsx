"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Me = {
  id: string;
  email: string;
  displayName: string | null;
  accountStatus: string;
  testSecretPrefix?: string;
  liveSecretPrefix?: string;
};

const MASKED_PLACEHOLDER = "•••••••••••••••";

export function KeysPageClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [testKeyVisible, setTestKeyVisible] = useState(false);
  const [liveKeyVisible, setLiveKeyVisible] = useState(false);
  const [revealedTestKey, setRevealedTestKey] = useState<string | null>(null);
  const [revealedLiveKey, setRevealedLiveKey] = useState<string | null>(null);
  const [revealLoading, setRevealLoading] = useState<"test" | "live" | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"test" | "live" | "new" | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Me | null) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  async function handleRegenerateTestKey() {
    setRegenError(null);
    setNewKey(null);
    setRegenerating(true);
    try {
      const res = await fetch("/api/keys/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = (await res.json()) as { apiKey?: string; error?: string };
      if (!res.ok) {
        setRegenError(data?.error ?? "Failed to generate new key.");
        return;
      }
      if (data.apiKey) setNewKey(data.apiKey);
    } catch {
      setRegenError("Network error. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }

  function copyKey(key: string, which?: "test" | "live" | "new") {
    navigator.clipboard.writeText(key);
    if (which) {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  async function toggleTestKeyReveal() {
    if (testKeyVisible) {
      setTestKeyVisible(false);
      setRevealedTestKey(null);
      setRevealError(null);
      return;
    }
    setRevealError(null);
    setRevealLoading("test");
    try {
      const res = await fetch("/api/keys/reveal?type=test", { credentials: "include" });
      const data = (await res.json()) as { key?: string; error?: string };
      if (!res.ok) {
        setRevealError(data?.error ?? "Could not load key.");
        return;
      }
      if (data.key) {
        setRevealedTestKey(data.key);
        setTestKeyVisible(true);
      }
    } catch {
      setRevealError("Network error.");
    } finally {
      setRevealLoading(null);
    }
  }

  async function toggleLiveKeyReveal() {
    if (liveKeyVisible) {
      setLiveKeyVisible(false);
      setRevealedLiveKey(null);
      setRevealError(null);
      return;
    }
    setRevealError(null);
    setRevealLoading("live");
    try {
      const res = await fetch("/api/keys/reveal?type=live", { credentials: "include" });
      const data = (await res.json()) as { key?: string; error?: string };
      if (!res.ok) {
        setRevealError(data?.error ?? "Could not load key.");
        return;
      }
      if (data.key) {
        setRevealedLiveKey(data.key);
        setLiveKeyVisible(true);
      }
    } catch {
      setRevealError("Network error.");
    } finally {
      setRevealLoading(null);
    }
  }

  if (!me) return null;

  const isVerified = me.accountStatus === "verified";

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">API Keys</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Use secret keys in the <code className="text-xs bg-[var(--muted)] px-1 rounded">Authorization: Bearer YOUR_SECRET_KEY</code> header. Never expose them in client-side code.
      </p>

      <div className="space-y-6">
        {newKey && (
          <Card className="border-[var(--primary)]/50 bg-[var(--primary)]/5">
            <CardHeader>
              <CardTitle className="text-base">New test key (save it now)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-[var(--muted-foreground)]">
                Your previous test key no longer works. Copy this key and store it securely.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 min-w-0 truncate rounded bg-[var(--muted)] px-3 py-2 text-sm font-mono">
                  {newKey}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyKey(newKey, "new")}
                >
                  {copied === "new" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">Test</span>
              Test secret key
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={handleRegenerateTestKey}
              disabled={regenerating}
            >
              {regenerating ? "Generating…" : "Generate new key"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {regenError && (
              <p className="text-sm text-[var(--error)]">{regenError}</p>
            )}
            <p className="text-sm text-[var(--muted-foreground)]">
              For development and testing. No real money is moved.
            </p>
            {revealError && (
              <p className="text-sm text-[var(--error)]">{revealError}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <code className="flex-1 min-w-0 truncate rounded bg-[var(--muted)] px-3 py-2 text-sm font-mono">
                {me.testSecretPrefix
                  ? testKeyVisible && revealedTestKey
                    ? revealedTestKey
                    : testKeyVisible && revealLoading === "test"
                      ? "Loading…"
                      : testKeyVisible && !revealedTestKey
                        ? "Unable to load"
                        : MASKED_PLACEHOLDER
                  : "Not set"}
              </code>
              {me.testSecretPrefix && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleTestKeyReveal}
                    disabled={revealLoading !== null}
                  >
                    {revealLoading === "test" ? "Loading…" : testKeyVisible ? "Hide" : "Show"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => revealedTestKey && copyKey(revealedTestKey, "test")}
                    disabled={!revealedTestKey}
                  >
                    {copied === "test" ? "Copied!" : "Copy"}
                  </Button>
                </>
              )}
            </div>
            {me.testSecretPrefix && !revealedTestKey && (
              <span className="text-xs text-[var(--muted-foreground)]">
                Click Show to reveal the full key, then Copy. If you created your account before this feature, generate a new key first.
              </span>
            )}
          </CardContent>
        </Card>

        <Card className={!isVerified ? "opacity-80" : undefined}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="rounded bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 text-xs font-medium">Live</span>
              Live secret key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isVerified ? (
              <>
                <p className="text-sm text-[var(--muted-foreground)]">
                  For production. Real transactions. Keep this key secure.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="flex-1 min-w-0 truncate rounded bg-[var(--muted)] px-3 py-2 text-sm font-mono">
                    {me.liveSecretPrefix
                      ? liveKeyVisible && revealedLiveKey
                        ? revealedLiveKey
                        : liveKeyVisible && revealLoading === "live"
                          ? "Loading…"
                          : liveKeyVisible && !revealedLiveKey
                            ? "Unable to load"
                            : MASKED_PLACEHOLDER
                      : "Not set"}
                  </code>
                  {me.liveSecretPrefix && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggleLiveKeyReveal}
                        disabled={revealLoading !== null}
                      >
                        {revealLoading === "live" ? "Loading…" : liveKeyVisible ? "Hide" : "Show"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => revealedLiveKey && copyKey(revealedLiveKey, "live")}
                        disabled={!revealedLiveKey}
                      >
                        {copied === "live" ? "Copied!" : "Copy"}
                      </Button>
                    </>
                  )}
                </div>
                {me.liveSecretPrefix && !revealedLiveKey && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Click Show to reveal the full key, then Copy.
                  </span>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Available after you complete account verification and document upload.
                </p>
                <Link
                  href="/dashboard/verification"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
                >
                  Go to Verification
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
