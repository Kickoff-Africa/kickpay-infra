import Link from "next/link";
import { DOC_ENDPOINTS } from "@/lib/docs/endpoints";
import { INTEGRATION_STACKS } from "@/lib/docs/integrations";
import { MethodBadge } from "@/components/docs/MethodBadge";

export const metadata = {
  title: "Documentation | Dashboard | KickPay",
  description: "KickPay API documentation",
};

export default function DocsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">API Documentation</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Use your secret key in the <code className="text-xs bg-[var(--muted)] px-1 rounded">Authorization: Bearer YOUR_SECRET_KEY</code> header for all API requests. Get your keys from the{" "}
        <Link href="/dashboard/keys" className="text-[var(--primary)] hover:underline">API Keys</Link> page.
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Authentication</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          Every request must include your secret key:
        </p>
        <pre className="rounded-lg bg-[var(--muted)] p-4 text-sm font-mono overflow-x-auto">
{`Authorization: Bearer sk_test_...  # or sk_live_... for production`}
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Endpoints</h2>
        <ul className="space-y-2">
          {DOC_ENDPOINTS.map((ep) => (
            <li key={ep.id}>
              <Link
                href={`/dashboard/docs/endpoints/${ep.id}`}
                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
              >
                <MethodBadge method={ep.method} />
                {ep.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Integration guides</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Set up the API in your stack:
        </p>
        <ul className="space-y-2">
          {INTEGRATION_STACKS.map((stack) => (
            <li key={stack.id}>
              <Link
                href={`/dashboard/docs/integrations/${stack.id}`}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                {stack.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
