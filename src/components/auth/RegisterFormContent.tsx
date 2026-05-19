"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ViewState = "idle" | "loading" | "error" | "success";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const requirements = [
  { label: "Must contain an uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
  { label: "Must contain a lowercase letter", check: (v: string) => /[a-z]/.test(v) },
  { label: "Must contain a number", check: (v: string) => /[0-9]/.test(v) },
  { label: "Must contain a special character", check: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { label: "Minimum of 8 characters", check: (v: string) => v.length >= 8 },
];

export function RegisterFormContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
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

  const emailError = email.length > 0 && !isValidEmail(email)
    ? "Enter a valid email address"
    : state === "error" && !email.trim()
      ? "Email cannot be empty"
      : undefined;

  const passwordError = state === "error" && !password
    ? "Password cannot be empty"
    : undefined;

  const nextRequirement = useMemo(() => {
    if (!passwordTouched) return null;
    const unmet = requirements.find((r) => !r.check(password));
    return unmet?.label ?? null;
  }, [password, passwordTouched]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setState("error");
      return;
    }
    if (name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      setState("error");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setState("error");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter.");
      setState("error");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter.");
      setState("error");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain a number.");
      setState("error");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain a special character.");
      setState("error");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed.");
        setState("error");
      } else {
        setState("success");
      }
    } catch {
      setError("An unexpected network error occurred.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50">
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
        label="Enter Full Name"
        name="name"
        type="text"
        autoComplete="name"
        autoFocus={shouldAutoFocus}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        error={
          state === "error" && !name.trim()
            ? "Name cannot be empty"
            : state === "error" && name.trim().length < 2
              ? "Full name must be at least 2 characters"
              : undefined
        }
      />

      <FormField
        label="Enter Email Address"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
        error={emailError}
      />

      <FormField
        label="Choose Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min 8 characters"
        onFocus={() => setPasswordTouched(true)}
        error={passwordError}
      />

      {nextRequirement && (
        <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">
          {nextRequirement}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={state === "loading"}
        disabled={state === "loading"}
        className="w-full h-12"
      >
        Create Account
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
  );
}
