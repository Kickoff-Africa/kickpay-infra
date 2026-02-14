import Link from "next/link";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = {
  title: "Complete profile | KickPay",
  description: "Add your business details",
};

export default function OnboardingPage() {
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
          Complete your business profile
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
