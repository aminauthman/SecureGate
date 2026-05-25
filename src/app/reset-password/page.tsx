"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants";

type ViewState = "idle" | "loading" | "error" | "success";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);

  const nextRequirement = useMemo(() => {
    if (!passwordTouched) return null;
    const unmet = PASSWORD_REQUIREMENTS.find((r) => !r.check(password));
    return unmet?.label ?? null;
  }, [password, passwordTouched]);

  if (!token) {
    return (
      <div className="w-full max-w-md p-6 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Link</h1>
        <p className="text-slate-600 dark:text-slate-400">No reset token provided. Use the full link from your email.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Password is required.");
      setState("error");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      setState("error");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setState("error");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Password reset failed.");
        setState("error");
      } else {
        setState("success");
        setTimeout(() => router.push("/auth?mode=signin"), 1500);
      }
    } catch {
      setError("An unexpected network error occurred.");
      setState("error");
    }
  }

  return (
    <div className="w-full max-w-md p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reset Your Password
        </h1>
        <p className="text-base font-normal text-slate-600 dark:text-slate-400">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50">
            {error}
          </div>
        )}

        {state === "success" && (
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50 space-y-2">
            <p>Password reset successfully!</p>
            <p className="font-normal">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="underline font-semibold"
              >
                Sign in with your new password
              </button>
            </p>
          </div>
        )}

        <FormField
          label="New Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}

          onFocus={() => setPasswordTouched(true)}
          error={state === "error" && !password ? "Password cannot be empty" : undefined}
        />

        {nextRequirement && (
          <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">
            {nextRequirement}
          </p>
        )}

        <FormField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}

          error={
            state === "error" && !confirmPassword
              ? "Confirm password cannot be empty"
              : state === "error" && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
          }
        />

        <Button
          type="submit"
          variant="primary"
          loading={state === "loading"}
          disabled={state === "loading" || state === "success"}
          className="w-full h-12"
        >
          Reset Password
        </Button>
        <div className="text-center">
          <a
            href="/auth?mode=signin"
            className="text-slate-700 dark:text-slate-200 hover:underline underline-offset-2 text-sm"
          >
            Back to Sign In
          </a>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <Suspense fallback={
        <div className="w-full max-w-md p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
