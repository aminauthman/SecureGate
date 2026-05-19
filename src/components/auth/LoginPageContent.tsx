"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ViewState = "idle" | "loading" | "error" | "success";

export function LoginPageContent() {
  const [showForgot, setShowForgot] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<ViewState>("idle");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShowVerificationNotice(false);

    if (!email || !password) {
      setState("error");
      return;
    }

    setState("loading");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email before signing in.");
          setShowVerificationNotice(true);
        } else {
          setError("Invalid email or password");
        }
        setState("error");
      } else {
        setState("success");
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred.");
      setState("error");
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setState("error");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        setState("error");
      } else {
        setState("success");
      }
    } catch {
      setError("An unexpected network error occurred.");
      setState("error");
    }
  }

  async function handleResendVerification(e: React.MouseEvent) {
    e.preventDefault();
    setResendState("loading");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendState("success");
      } else {
        setError(data.message || "Something went wrong.");
        setResendState("idle");
      }
    } catch {
      setError("An unexpected network error occurred.");
      setResendState("idle");
    }
  }

  if (showForgot) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Reset Password
          </h1>
          <p className="text-base font-normal text-slate-600 dark:text-slate-400">
            We&apos;ll send you a reset link
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          {error && (
            <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50">
              {error}
            </div>
          )}
          {state === "success" && (
            <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50">
              If an account exists, a reset link has been sent.
            </div>
          )}
          <FormField
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            error={state === "error" && !email ? "Email cannot be empty" : undefined}
          />
          <Button
            type="submit"
            variant="primary"
            loading={state === "loading"}
            disabled={state === "loading" || state === "success"}
            className="w-full h-12"
          >
            Send Reset Link
          </Button>
        </form>
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => { setShowForgot(false); setState("idle"); setError(null); }}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign In
        </h1>
        <p className="text-base font-normal text-slate-600 dark:text-slate-400">
          Access your SecureGate IAM Console
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50">
            {error}
          </div>
        )}
        {state === "success" && (
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50">
            Sign in successful! Redirecting...
          </div>
        )}

        {showVerificationNotice && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400 space-y-2">
            <p>Check your inbox for the verification email.</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendState === "loading" || resendState === "success"}
              className="underline underline-offset-2 font-semibold hover:text-amber-800 dark:hover:text-amber-300 disabled:opacity-50"
            >
              {resendState === "loading" ? "Sending..." : resendState === "success" ? "Verification email sent!" : "Resend verification email"}
            </button>
          </div>
        )}

        <FormField
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          error={state === "error" && !email ? "Email cannot be empty" : undefined}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          error={state === "error" && !password ? "Password cannot be empty" : undefined}
        />

        <Button
          type="submit"
          variant="primary"
          loading={state === "loading"}
          disabled={state === "loading" || state === "success"}
          className="w-full h-12"
        >
          Sign In
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <button
          type="button"
          onClick={() => { setShowForgot(true); setState("idle"); setError(null); }}
          className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          Forgot your password?
        </button>
        <p className="text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <a
            href="/auth"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
