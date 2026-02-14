import { notFound } from "next/navigation";
import Link from "next/link";
import { getIntegrationBySlug, INTEGRATION_STACKS } from "@/lib/docs/integrations";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return INTEGRATION_STACKS.map((s) => ({ slug: s.id }));
}

export default async function IntegrationPage({ params }: PageProps) {
  const { slug } = await params;
  const stack = getIntegrationBySlug(slug);
  if (!stack) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/docs"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          ← Documentation
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        {stack.name}
      </h1>
      <p className="text-[var(--muted-foreground)] mb-8">{stack.description}</p>

      {stack.install && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Install</h2>
          <pre className="rounded-lg bg-[var(--muted)] p-4 text-sm font-mono overflow-x-auto">
            {stack.install}
          </pre>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Example</h2>
        <pre className="rounded-lg bg-[var(--muted)] p-4 text-sm font-mono overflow-x-auto whitespace-pre">
          {stack.example}
        </pre>
      </section>

      {stack.notes && (
        <p className="text-sm text-[var(--muted-foreground)]">{stack.notes}</p>
      )}
    </div>
  );
}
