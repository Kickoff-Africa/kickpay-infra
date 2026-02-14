import { cn } from "@/lib/utils";
import type { HttpMethod } from "@/lib/docs/endpoints";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-500/15 text-green-700 dark:text-green-400 font-mono",
  POST: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 font-mono",
  PUT: "bg-blue-500/15 text-blue-700 dark:text-blue-400 font-mono",
  PATCH: "bg-purple-500/15 text-purple-700 dark:text-purple-400 font-mono",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-400 font-mono",
};

export function MethodBadge({
  method,
  className,
}: {
  method: HttpMethod;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold",
        METHOD_COLORS[method] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]",
        className
      )}
    >
      {method}
    </span>
  );
}
