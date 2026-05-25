"use client";

import React, { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Verify Your Email
        </h1>
        <p className="text-base font-normal text-slate-600 dark:text-slate-400">
          You need to verify your email address before accessing the dashboard.
          Check your inbox for the verification link (expires in 15 minutes).
        </p>

        {sent ? (
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50">
            If an account exists, a new verification link has been sent.
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-4">
            {error && (
              <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50">
                {error}
              </div>
            )}
            <FormField
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !email}
              className="w-full h-12"
            >
              Resend Verification Email
            </Button>
          </form>
        )}

        <div className="text-sm">
          <a href="/auth?mode=signin" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
            Back to Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
