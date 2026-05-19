"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ViewState = "idle" | "loading" | "error" | "success";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email before signing in.");
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
  };

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

      <form onSubmit={handleSubmit} className="space-y-4">
        {state === "error" && error && (
          <div
            role="alert"
            className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50"
          >
            {error}
          </div>
        )}

        {state === "success" && (
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50">
            Sign in successful! Redirecting...
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

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
