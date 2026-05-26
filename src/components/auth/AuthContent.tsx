"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

type ViewState = "idle" | "loading" | "error" | "success";
type AuthMode = "signin" | "signup" | "forgot";

export function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = (searchParams.get("mode") as AuthMode) || "signup";
  const justVerified = searchParams.get("verified") === "true";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<ViewState>("idle");
  const csrfTokenRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data) => { csrfTokenRef.current = data.csrfToken })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
      const timer = setTimeout(() => document.getElementById("name")?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setState("idle");
    setError(null);
    setResendState("idle");
    router.replace(`/auth?mode=${newMode}`, { scroll: false });
  }, [router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setState("error");
      return;
    }

    setState("loading");
    try {
      let error: string | undefined;

      if (csrfTokenRef.current) {
        const res = await fetch("/api/auth/callback/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            csrfToken: csrfTokenRef.current,
            email,
            password,
            json: "true",
          }),
        });
        const data = await res.json();
        error = data.error;
      } else {
        const result = await signIn("credentials", { email, password, redirect: false });
        error = result?.error;
      }

      if (error) {
        if (error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email before signing in.");
        } else if (error === "TOO_MANY_ATTEMPTS") {
          setError("Too many attempts! Try again later.");
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

  async function handleSignUp(e: React.FormEvent) {
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

    setState("loading");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        setState("error");
      } else {
        setState("success");
        setTimeout(() => switchMode("signin"), 5000);
      }
    } catch {
      setError("An unexpected network error occurred.");
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

  return (
    <div className="w-full max-w-md p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {mode === "signin" && "Sign In"}
          {mode === "signup" && "Create Account"}
          {mode === "forgot" && "Reset Password"}
        </h1>
        <p className="text-base font-normal text-slate-600 dark:text-slate-400">
          {mode === "signin" && "Access your SecureGate IAM Console"}
          {mode === "signup" && "Join the SecureGate IAM Platform"}
          {mode === "forgot" && "We'll send you a reset link"}
        </p>
      </div>

      {mode === "signup" && (
        <>
          <SignUpForm
            email={email}
            password={password}
            name={name}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onNameChange={setName}
            onSubmit={handleSignUp}
            error={error}
            state={state}
          />
          <div className="text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </>
      )}

      {mode === "signin" && (
        <>
          <SignInForm
            email={email}
            password={password}
            justVerified={justVerified}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSignIn}
            onForgotPassword={() => switchMode("forgot")}
            error={error}
            state={state}
          />
          {error === "Please verify your email before signing in." && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendState === "loading"}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendState === "loading" ? "Sending..." : "Resend verification email"}
              </button>
            </div>
          )}
          {resendState === "success" && (
            <div className="text-sm text-center text-emerald-600 dark:text-emerald-400">
              Verification email sent!
            </div>
          )}
          <div className="text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 font-semibold cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </>
      )}

      {mode === "forgot" && (
        <ForgotPasswordForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleForgotPassword}
          error={error}
          state={state}
        />
      )}
    </div>
  );
}
