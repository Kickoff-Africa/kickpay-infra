import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "KickPay | NGN–CNY Payments",
  description: "Bridge NGN and CNY payments with KickPay",
};

const linkButtonClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 h-10 px-4 py-2 min-w-[180px]";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <main className="max-w-xl text-center space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          KickPay
        </h1>
        <p className="text-lg text-muted-foreground">
          Cross-border payment APIs for businesses. Register to get API keys and integrate with your product.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className={cn(
              linkButtonClass,
              "bg-primary text-primary-foreground hover:opacity-90"
            )}
          >
            Register for API keys
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              linkButtonClass,
              "border border-border bg-transparent hover:bg-muted"
            )}
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
