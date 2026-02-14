"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verificationSubmitSchema, type VerificationSubmitInput } from "@/lib/validations/verification";

type Me = {
  id: string;
  accountStatus: string;
};

type Submission = {
  id: string;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
};

export function VerificationPageClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  const form = useForm<VerificationSubmitInput>({
    resolver: zodResolver(verificationSubmitSchema),
    defaultValues: { bvn: "", tin: "" },
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
    ])
      .then(([meData, statusData]) => {
        setMe(meData);
        setSubmission(statusData?.submission ?? null);
      })
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(data: VerificationSubmitInput) {
    if (!cacFile || cacFile.size === 0) {
      setSubmitError("Please select your CAC document.");
      return;
    }
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.set("bvn", data.bvn);
      formData.set("tin", data.tin);
      formData.append("cacDocument", cacFile);
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
      setSubmission({
        id: "",
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      form.reset();
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
      <div className="p-6 lg:p-8 max-w-3xl">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  if (!me) return null;

  const isVerified = me.accountStatus === "verified";
  const hasPending = submission?.status === "pending";
  const isRejected = submission?.status === "rejected";

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Verification</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Submit your BVN, TIN, and company documents for review. Once approved, you’ll get access to live API keys.
      </p>

      {isVerified && (
        <Card className="mb-6 border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-base text-green-700 dark:text-green-400">Account verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your account is verified. You can use live API keys from the API Keys page.
            </p>
          </CardContent>
        </Card>
      )}

      {!isVerified && hasPending && (
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-base text-yellow-700 dark:text-yellow-400">Under review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your verification was submitted and is being reviewed. We’ll notify you once it’s approved.
            </p>
          </CardContent>
        </Card>
      )}

      {!isVerified && isRejected && (
        <Card className="mb-6 border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-base text-red-700 dark:text-red-400">Not approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              {submission.rejectionReason ?? "Your submission was not approved. You can resubmit with updated documents."}
            </p>
          </CardContent>
        </Card>
      )}

      {!isVerified && !hasPending && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submit for verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-[var(--muted-foreground)]">
              Provide your BVN, TIN, and upload your CAC document. You may add other supporting documents (e.g. utility bill, ID).
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                    <p className="text-sm text-[var(--error)]">{errors.bvn.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin">TIN (Tax Identification Number)</Label>
                  <Input
                    id="tin"
                    type="text"
                    placeholder="Your TIN"
                    {...register("tin")}
                  />
                  {errors.tin && (
                    <p className="text-sm text-[var(--error)]">{errors.tin.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacDocument">CAC document (required)</Label>
                <Input
                  id="cacDocument"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => setCacFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-[var(--muted-foreground)]">PDF, JPEG or PNG. Max 10MB.</p>
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
                <p className="text-xs text-[var(--muted-foreground)]">e.g. utility bill, ID. PDF, JPEG or PNG. Max 10MB each.</p>
              </div>

              {submitError && (
                <p className="text-sm text-[var(--error)]">{submitError}</p>
              )}

              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? "Submitting…" : "Submit for review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
