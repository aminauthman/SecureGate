"use client";

import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  state: "idle" | "loading" | "error" | "success";
}

export function ForgotPasswordForm({
  email, onEmailChange, onSubmit, error, state,
}: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        onChange={(e) => onEmailChange(e.target.value)}
        error={state === "error" && !email ? "Email cannot be empty" : undefined}
      />

      <Button
        type="submit"
        variant="primary"
        loading={state === "loading"}
        disabled={state === "loading" || state === "success"}
        className="w-full h-12 mt-2"
      >
        Send Reset Link
      </Button>
    </form>
  );
}
