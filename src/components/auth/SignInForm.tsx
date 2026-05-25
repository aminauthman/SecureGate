"use client";

import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

interface SignInFormProps {
  email: string;
  password: string;
  justVerified: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  error: string | null;
  state: "idle" | "loading" | "error" | "success";
}

export function SignInForm({
  email, password, justVerified,
  onEmailChange, onPasswordChange,
  onSubmit, onForgotPassword,
  error, state,
}: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {justVerified && state === "idle" && (
        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50">
          Your email has been verified! Sign in to access the dashboard.
        </div>
      )}

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

      <FormField
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        error={state === "error" && !email ? "Email cannot be empty" : undefined}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        error={state === "error" && !password ? "Password cannot be empty" : undefined}
        labelEnd={
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-slate-500 hover:underline underline-offset-2 cursor-pointer"
          >
            Forgot password?
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        loading={state === "loading"}
        disabled={state === "loading" || state === "success"}
        className="w-full h-12 mt-2"
      >
        Sign In
      </Button>
    </form>
  );
}
