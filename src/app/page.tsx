import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Products } from "@/components/landing/Products";
import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "KickPay | Pay in Naira. Settle in China.",
  description:
    "API-first cross-border payments for Nigerian businesses. Collect NGN, settle in CNY with T+1. Get API keys and integrate in minutes.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Products />
        <About />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
