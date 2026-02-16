"use client";

const steps = [
  {
    step: "1",
    title: "Create account",
    description: "Register and complete onboarding. Get test API keys instantly.",
  },
  {
    step: "2",
    title: "Add recipients",
    description: "Create recipients in China (or other supported countries) via API or dashboard.",
  },
  {
    step: "3",
    title: "Create transfer",
    description: "Initiate a transfer in NGN. Get a payment reference for your customer.",
  },
  {
    step: "4",
    title: "Customer pays",
    description: "Your customer pays in Naira. We receive funds, run FX, and settle T+1 to your recipient.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-[var(--muted)]/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
            How it works
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Four steps from signup to settlement. No hidden complexity.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {item.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-[var(--border)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
