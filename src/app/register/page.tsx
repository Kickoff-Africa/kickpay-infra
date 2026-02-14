import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Register | KickPay",
  description: "Create your KickPay account",
};

export default function RegisterPage() {
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
          Create your account with email and password
        </p>
      </div>
      <RegisterForm />
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
