"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MethodBadge } from "@/components/docs/MethodBadge";
import type { DocEndpoint } from "@/lib/docs/endpoints";

const STORAGE_KEY_SECRET = "kickpay_docs_secret_key";
const STORAGE_KEY_TRYIT_PREFIX = "kickpay_docs_tryit_";

function getResolvedPath(path: string, pathParams: Record<string, string>): string {
  let resolved = path;
  for (const [key, value] of Object.entries(pathParams)) {
    resolved = resolved.replace(`:${key}`, value || `:${key}`);
  }
  return resolved;
}

function getStoredSecret(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY_SECRET) ?? "";
  } catch {
    return "";
  }
}

function getStoredTryitData(endpointId: string): { pathParams?: Record<string, string>; body?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRYIT_PREFIX + endpointId);
    if (!raw) return null;
    return JSON.parse(raw) as { pathParams?: Record<string, string>; body?: string };
  } catch {
    return null;
  }
}

interface TryItProps {
  endpoint: DocEndpoint;
  /** Optional secret key to use (e.g. from dashboard context). If not provided, user must paste. */
  defaultSecretKey?: string;
}

export function TryIt({ endpoint, defaultSecretKey = "" }: TryItProps) {
  const [secretKey, setSecretKey] = useState(defaultSecretKey);
  const [pathParams, setPathParams] = useState<Record<string, string>>(
    (endpoint.pathParams ?? []).reduce((acc, p) => ({ ...acc, [p]: "" }), {})
  );
  const [body, setBody] = useState(endpoint.bodySample ?? "{}");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; data: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore persisted secret key and per-endpoint test data when mounting or switching endpoint
  useEffect(() => {
    const storedSecret = getStoredSecret();
    if (storedSecret) setSecretKey(storedSecret);
    const stored = getStoredTryitData(endpoint.id);
    const paramKeys = endpoint.pathParams ?? [];
    const initialPathParams = paramKeys.reduce(
      (acc, p) => ({ ...acc, [p]: stored?.pathParams?.[p] ?? "" }),
      {} as Record<string, string>
    );
    setPathParams(initialPathParams);
    setBody(
      stored?.body != null && stored.body !== "" ? stored.body : endpoint.bodySample ?? "{}"
    );
  }, [endpoint.id, endpoint.pathParams, endpoint.bodySample]);

  // Persist secret key when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (secretKey) localStorage.setItem(STORAGE_KEY_SECRET, secretKey);
      else localStorage.removeItem(STORAGE_KEY_SECRET);
    } catch {}
  }, [secretKey]);

  // Persist path params and body for this endpoint when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = { pathParams, body };
      localStorage.setItem(STORAGE_KEY_TRYIT_PREFIX + endpoint.id, JSON.stringify(payload));
    } catch {}
  }, [endpoint.id, pathParams, body]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const path = getResolvedPath(endpoint.path, pathParams);
  const url = `${baseUrl}${path}`;

  const usesBearer = endpoint.path !== "/api/auth/me";

  async function runRequest() {
    setError(null);
    setResponse(null);
    if (usesBearer && !secretKey.trim()) {
      setError("Enter your secret key above (paste the key you saved at signup).");
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (secretKey.trim()) {
        headers.Authorization = `Bearer ${secretKey.trim()}`;
      }
      let res: Response;
      if (endpoint.method === "GET") {
        res = await fetch(url, { method: "GET", headers, credentials: "include" });
      } else {
        let parsed: string;
        try {
          JSON.parse(body);
          parsed = body;
        } catch {
          setError("Invalid JSON in request body.");
          setLoading(false);
          return;
        }
        res = await fetch(url, {
          method: endpoint.method,
          headers,
          body: parsed,
          credentials: "include",
        });
      }
      const text = await res.text();
      let data: string;
      try {
        data = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        data = text;
      }
      setResponse({ status: res.status, data });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-2 bg-[var(--muted)]/50">
        <span className="text-sm font-medium text-[var(--foreground)]">Try it</span>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            {usesBearer
              ? "Secret key (paste the key you saved at signup)"
              : "Secret key (optional — this endpoint uses your session cookie)"}
          </label>
          <input
            type="password"
            placeholder={usesBearer ? "Paste your full secret key (sk_test_... or sk_live_...)" : "Leave empty to use session"}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 text-sm font-mono"
          />
        </div>

        {endpoint.pathParams && endpoint.pathParams.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Path parameters</span>
            <div className="flex flex-wrap gap-2">
              {endpoint.pathParams.map((p) => (
                <div key={p} className="flex items-center gap-1">
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">{p}:</span>
                  <input
                    type="text"
                    value={pathParams[p] ?? ""}
                    onChange={(e) => setPathParams((prev) => ({ ...prev, [p]: e.target.value }))}
                    placeholder={p}
                    className="rounded border border-[var(--input)] bg-transparent px-2 py-1 text-sm font-mono w-32"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {(endpoint.method === "POST" || endpoint.method === "PUT" || endpoint.method === "PATCH") && (
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Request body (JSON)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 text-sm font-mono"
              spellCheck={false}
            />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={runRequest} disabled={loading}>
            {loading ? "Sending…" : "Send request"}
          </Button>
          <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <MethodBadge method={endpoint.method} />
            <span className="font-mono">{path}</span>
          </span>
        </div>

        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}

        {response && (
          <div>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              Response {response.status}
            </span>
            <pre className="mt-1 rounded-lg bg-[var(--muted)] p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {response.data}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
