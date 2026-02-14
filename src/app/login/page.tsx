import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Log in | KickPay",
  description: "Log in to your KickPay account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--muted)]/30">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to home
        </Link>
      </div>
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          KickPay
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Log in to access your API keys and dashboard
        </p>
      </div>
      <LoginForm />
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">
        Don’t have an account?{" "}
        <Link href="/onboarding" className="text-[var(--primary)] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
