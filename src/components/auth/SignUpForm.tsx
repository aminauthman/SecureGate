"use client";

import React, { useState, useEffect } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ViewState = "idle" | "loading" | "error" | "success";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFromMarketing =
      params.get("ref") === "marketing" ||
      params.get("from") === "marketing" ||
      (typeof document !== "undefined" && document.referrer && document.referrer.includes("marketing"));
    
    if (isFromMarketing) {
      setTimeout(() => {
        setShouldAutoFocus(true);
      }, 0);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      setState("error");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      setState("error");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Try again.");
        setState("error");
      } else {
        setState("success");
      }
    } catch {
      setError("An unexpected network error occurred.");
      setState("error");
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Create Account
        </h1>
        <p className="text-base font-normal text-slate-600 dark:text-slate-400">
          Join the SecureGate IAM Platform
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
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50 space-y-2">
            <p>Account created! Check your inbox for a verification email.</p>
            <p className="font-normal">Click the link in the email to activate your account, then sign in.</p>
          </div>
        )}

        <FormField
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          error={state === "error" && !name ? "Name cannot be empty" : undefined}
          autoFocus={shouldAutoFocus}
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 12 characters"
            error={
              state === "error" && !password
                ? "Password cannot be empty"
                : state === "error" && password.length < 12
                  ? "Password must be at least 12 chars"
                  : undefined
            }
        />

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
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
        disabled={state === "loading"}
        className="w-full h-12"
      >
        Sign Up
      </Button>

      {state === "success" && (
        <div className="text-center">
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
          >
            Sign In
          </a>
        </div>
      )}
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <a
            href="/auth"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
