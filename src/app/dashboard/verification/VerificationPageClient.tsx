"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { verificationSubmitSchema, type VerificationSubmitInput } from "@/lib/validations/verification";

type Me = {
  id: string;
  accountStatus: string;
  displayName?: string;
  phone?: string;
  businessPhone?: string;
  countryCode?: string;
  defaultCurrency?: string;
};

type Submission = {
  id: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  bvn: string;
  tin: string;
  cacDocumentUrl: string;
  additionalDocumentUrls: string[];
};

export function VerificationPageClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const form = useForm<VerificationSubmitInput>({
    resolver: zodResolver(verificationSubmitSchema),
    defaultValues: {
      bvn: "",
      tin: "",
      countryCode: "",
      currency: "NGN",
      businessName: "",
      phone: "",
      businessPhone: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/verification/status", { credentials: "include" }).then((r) => (r.ok ? r.json() : { submission: null })),
      fetch("/api/countries").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([meData, statusData, countriesData]) => {
        setMe(meData);
        const latest = statusData?.submission ?? null;
        setSubmission(latest);
        setCountries(Array.isArray(countriesData) ? countriesData : []);

        form.reset({
          bvn: latest?.bvn ?? "",
          tin: latest?.tin ?? "",
          countryCode: (latest?.bvn && meData?.countryCode) ? meData.countryCode : meData?.countryCode ?? "",
          currency: meData?.defaultCurrency ?? "NGN",
          businessName: meData?.displayName ?? "",
          phone: meData?.phone ?? "",
          businessPhone: meData?.businessPhone ?? "",
        });
      })
      .catch(() => setMe(null))
      .finally(() => {
        setCountriesLoading(false);
        setLoading(false);
      });
  }, [form]);

  async function onSubmit(data: VerificationSubmitInput) {
    const isNewSubmission = !submission;
    if (isNewSubmission && (!cacFile || cacFile.size === 0)) {
      setSubmitError("Please select your CAC document.");
      return;
    }
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.set("bvn", data.bvn);
      formData.set("tin", data.tin);
      formData.set("countryCode", data.countryCode);
      formData.set("currency", data.currency);
      formData.set("businessName", data.businessName);
      formData.set("phone", data.phone);
      if (data.businessPhone) {
        formData.set("businessPhone", data.businessPhone);
      }
      if (cacFile && cacFile.size > 0) {
        formData.append("cacDocument", cacFile);
      }
      additionalFiles.forEach((f) => {
        if (f.size > 0) formData.append("additionalDocuments", f);
      });
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSubmitError(json?.error ?? "Submission failed.");
        return;
      }
      // Re-fetch latest submission details so we have updated values and document URLs.
      const refreshed = await fetch("/api/verification/status", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : { submission: null }
      );
      setSubmission(refreshed.submission ?? null);
      setCacFile(null);
      setAdditionalFiles([]);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="rounded-lg border border-border bg-card px-4 py-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading verification details…</p>
        </div>
      </div>
    );
  }

  if (!me) return null;

  const isVerified = me.accountStatus === "verified";
  const hasPending = submission?.status === "pending";
  const isRejected = submission?.status === "rejected";
  const countryCodeValue = form.watch("countryCode");
  const currencyValue = form.watch("currency");

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verification</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Share your business details and upload your company documents. Once approved, you’ll get
            access to live API keys.
          </p>
        </div>
        {submission && (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                submission.status === "pending" &&
                  "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
                submission.status === "approved" &&
                  "bg-green-500/15 text-green-700 dark:text-green-400",
                submission.status === "rejected" &&
                  "bg-red-500/15 text-red-700 dark:text-red-400",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {submission.status === "pending"
                ? "Under review"
                : submission.status === "approved"
                ? "Accepted"
                : "Rejected"}
            </span>
            <p className="text-[11px] text-muted-foreground">
              Last submitted on {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {isVerified && (
        <Card className="border-green-500/30 bg-green-500/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-green-700 dark:text-green-400">Account verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account is verified. You can use live API keys from the API Keys page.
            </p>
          </CardContent>
        </Card>
      )}

      {!isVerified && (
        <Card className="mt-2 shadow-sm border-border/80">
          <CardHeader>
            <CardTitle className="text-base">
              {submission ? "Edit verification details" : "Submit for verification"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="e.g. Acme Inc."
                      {...register("businessName")}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-error">{errors.businessName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bvn">BVN (Bank Verification Number)</Label>
                    <Input
                      id="bvn"
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="11 digits"
                      {...register("bvn")}
                    />
                    {errors.bvn && (
                      <p className="text-sm text-error">{errors.bvn.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tin">TIN (Tax Identification Number)</Label>
                    <Input id="tin" type="text" placeholder="Your TIN" {...register("tin")} />
                    {errors.tin && <p className="text-sm text-error">{errors.tin.message}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      {...register("phone")}
                    />
                    {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business phone (optional)</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      {...register("businessPhone")}
                    />
                    {errors.businessPhone && (
                      <p className="text-sm text-error">{errors.businessPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Country</Label>
                    <Select
                      id="countryCode"
                      disabled={countriesLoading}
                      value={countryCodeValue}
                      onChange={(e) => form.setValue("countryCode", e.target.value)}
                    >
                      <option value="">Select your country</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    {errors.countryCode && (
                      <p className="text-sm text-error">{errors.countryCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Settlement currency</Label>
                    <Select
                      id="currency"
                      value={currencyValue}
                      onChange={(e) => form.setValue("currency", e.target.value)}
                    >
                      <option value="NGN">NGN — Nigerian Naira</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="CNY">CNY — Chinese Yuan</option>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-error">{errors.currency.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cacDocument">
                    CAC document {submission ? "(optional – leave empty to keep current)" : "(required)"}
                  </Label>
                  <Input
                    id="cacDocument"
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    onChange={(e) => setCacFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    PDF, JPEG or PNG. Max 10MB.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalDocuments">Other documents (optional)</Label>
                  <Input
                    id="additionalDocuments"
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    multiple
                    onChange={(e) => setAdditionalFiles(Array.from(e.target.files ?? []))}
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g. utility bill, ID. PDF, JPEG or PNG. Max 10MB each.
                  </p>
                </div>

                {submitError && (
                  <p className="text-sm text-error">{submitError}</p>
                )}

                <Button type="submit" disabled={submitLoading}>
                  {submitLoading
                    ? submission
                      ? "Updating…"
                      : "Submitting…"
                    : submission
                    ? "Save changes"
                    : "Submit for review"}
                </Button>
              </form>

              <div className="space-y-4 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 border-border/80">
                <h2 className="text-sm font-semibold text-foreground">
                  Attached documents & details
                </h2>

                {!submission && (
                  <p className="text-sm text-muted-foreground">
                    Once you submit, your documents and verification details will appear here so you
                    can review them later.
                  </p>
                )}

                {submission && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Business name
                      </p>
                      <p className="font-medium">
                        {me?.displayName || "(not set)"}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="font-medium">{me?.phone || "(not set)"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Business phone
                        </p>
                        <p className="font-medium">{me?.businessPhone || "—"}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Country
                        </p>
                        <p className="font-medium">
                          {countryCodeValue || me?.countryCode || "(not set)"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Currency
                        </p>
                        <p className="font-medium">
                          {currencyValue || me?.defaultCurrency || "(not set)"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Current BVN
                      </p>
                      <p className="font-medium tracking-wide">{submission.bvn}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Current TIN
                      </p>
                      <p className="font-medium">{submission.tin}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        CAC document
                      </p>
                      {submission.cacDocumentUrl ? (
                        <a
                          href={submission.cacDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          View CAC document
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">No CAC document found.</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Other documents
                      </p>
                      {submission.additionalDocumentUrls.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {submission.additionalDocumentUrls.map((url, idx) => (
                            <li key={url}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Document {idx + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No additional documents attached.
                        </p>
                      )}
                    </div>

                    {isRejected && submission.rejectionReason && (
                      <div className="rounded-md border border-red-500/40 bg-red-500/5 p-3">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                          Rejection reason
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
