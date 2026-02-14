import { notFound } from "next/navigation";
import Link from "next/link";
import { getEndpointBySlug, DOC_ENDPOINTS } from "@/lib/docs/endpoints";
import { MethodBadge } from "@/components/docs/MethodBadge";
import { TryIt } from "../../TryIt";
import { EndpointPageClient } from "./EndpointPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DOC_ENDPOINTS.map((ep) => ({ slug: ep.id }));
}

export default async function EndpointPage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getEndpointBySlug(slug);
  if (!endpoint) notFound();

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
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2 flex-wrap">
        <MethodBadge method={endpoint.method} />
        {endpoint.title}
      </h1>
      <p className="text-[var(--muted-foreground)] mb-6">{endpoint.description}</p>
      <p className="text-sm font-mono text-[var(--muted-foreground)] mb-8">
        {endpoint.path}
      </p>

      <EndpointPageClient endpoint={endpoint} />
    </div>
  );
}
