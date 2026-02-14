"use client";

import { useState } from "react";
import type { DocEndpoint } from "@/lib/docs/endpoints";
import { TryIt } from "../../TryIt";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const STACKS = [
  { id: "node", label: "Node.js" },
  { id: "php", label: "PHP" },
  { id: "python", label: "Python" },
  { id: "curl", label: "cURL" },
] as const;

export function EndpointPageClient({ endpoint }: { endpoint: DocEndpoint }) {
  const [tab, setTab] = useState("node");

  return (
    <div className="space-y-8">
      <TryIt endpoint={endpoint} defaultSecretKey="" />

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Example responses
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-2 bg-green-500/10">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Success {endpoint.exampleSuccess.status}
              </span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap bg-[var(--muted)]/30">
              {endpoint.exampleSuccess.body}
            </pre>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-2 bg-red-500/10">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Error {endpoint.exampleError.status}
              </span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap bg-[var(--muted)]/30">
              {endpoint.exampleError.body}
            </pre>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Code examples
        </h2>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {STACKS.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {STACKS.map((s) => (
            <TabsContent key={s.id} value={s.id}>
              <pre className="rounded-lg bg-[var(--muted)] p-4 text-sm font-mono overflow-x-auto whitespace-pre">
                {endpoint.snippets[s.id]}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
