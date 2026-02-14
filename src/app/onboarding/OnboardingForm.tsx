"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  onboardingCompleteSchema,
  onboardingStep1Schema,
  type OnboardingCompleteInput,
} from "@/lib/validations/onboarding";
import type { CountryOption } from "@/app/api/countries/route";

const STEPS = [
  { id: 1, title: "Business details" },
  { id: 2, title: "Country" },
] as const;

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const form = useForm<OnboardingCompleteInput>({
    resolver: zodResolver(onboardingCompleteSchema),
    mode: "onBlur",
    defaultValues: {
      phone: "",
      businessName: "",
      countryCode: "",
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  const phone = watch("phone");
  const businessName = watch("businessName");
  const countryCode = watch("countryCode");

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CountryOption[]) => setCountries(data))
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, []);

  const onStep1Next = () => {
    const result = onboardingStep1Schema.safeParse(getValues());
    if (result.success) {
      clearErrors();
      setStep(2);
    } else {
      const err = result.error.flatten().fieldErrors;
      if (err.phone?.[0]) setError("phone", { message: err.phone[0] });
      if (err.businessName?.[0]) setError("businessName", { message: err.businessName[0] });
    }
  };

  const onComplete = async (data: OnboardingCompleteInput) => {
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone: data.phone.trim(),
          businessName: data.businessName.trim(),
          countryCode: data.countryCode.toUpperCase(),
        }),
      });
      let apiData: { error?: string } = {};
      try {
        apiData = (await res.json()) as { error?: string };
      } catch {
        setError("root", { message: "We couldn't read the server response. Please try again." });
        return;
      }
      if (!res.ok) {
        setError("root", {
          message: typeof apiData?.error === "string" ? apiData.error : "Something went wrong. Please try again.",
        });
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("root", { message: "Network error or server unavailable. Please try again." });
    }
  };

  const handleNextOrSubmit = () => {
    if (step < 2) {
      onStep1Next();
    } else {
      form.handleSubmit(onComplete)();
    }
  };

  const canProceedStep1 = phone.trim() && businessName.trim();
  const canProceedStep2 = countryCode.length === 2;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={cn(
                "text-xs font-medium",
                step >= s.id ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
              )}
            >
              Step {s.id}
            </span>
          ))}
        </div>
        <div className="flex gap-1 mb-4">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                step >= s.id ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
              )}
            />
          ))}
        </div>
        <CardTitle>{STEPS[step - 1].title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                autoFocus
                autoComplete="tel"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-[var(--error)]">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                placeholder="e.g. Acme Inc."
                autoComplete="organization"
                {...register("businessName")}
              />
              {errors.businessName && (
                <p className="text-sm text-[var(--error)]">{errors.businessName.message}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              disabled={countriesLoading}
              {...register("countryCode")}
            >
              <option value="">Select your country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.countryCode && (
              <p className="text-sm text-[var(--error)]">{errors.countryCode.message}</p>
            )}
            {countriesLoading && (
              <p className="text-xs text-[var(--muted-foreground)]">Loading countries…</p>
            )}
          </div>
        )}

        {errors.root && (
          <p className="text-sm text-[var(--error)]">{errors.root.message}</p>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNextOrSubmit}
            disabled={
              isSubmitting ||
              (step === 1 && !canProceedStep1) ||
              (step === 2 && (!canProceedStep2 || countriesLoading))
            }
            className="flex-1"
          >
            {isSubmitting ? "Saving…" : step === 2 ? "Complete" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
