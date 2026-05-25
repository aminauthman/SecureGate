"use client";

import { useState, useMemo } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants";

function getPasswordStrength(password: string): { label: string; boxes: number } {
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  let lengthScore = 0;
  if (length >= 16) lengthScore = 3;
  else if (length >= 12) lengthScore = 2;
  else if (length >= 8) lengthScore = 1;

  const total = lengthScore + variety;

  let boxes = 1;
  if (total >= 6) boxes = 4;
  else if (total >= 4) boxes = 3;
  else if (total >= 2) boxes = 2;

  const labels = ["Basic", "Fair", "Good", "Strong"];
  return { label: labels[boxes - 1], boxes };
}

const boxColors = ["bg-orange-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
const textColors = ["text-orange-500", "text-orange-500", "text-amber-500", "text-emerald-500"];

function PasswordStrength({ password }: { password: string }) {
  const { label, boxes } = getPasswordStrength(password);

  return (
    <div className="flex items-center gap-2 -mt-1">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-3 transition-colors duration-200 ${
              i < boxes ? boxColors[i] : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <span className={`text-[11px] font-medium leading-none ${textColors[boxes - 1]}`}>
        {label}
      </span>
    </div>
  );
}

interface SignUpFormProps {
  email: string;
  password: string;
  name: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  state: "idle" | "loading" | "error" | "success";
  shouldAutoFocus?: boolean;
}

export function SignUpForm({
  email, password, name,
  onEmailChange, onPasswordChange, onNameChange,
  onSubmit, error, state,
  shouldAutoFocus,
}: SignUpFormProps) {
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const nameError = nameTouched && !name.trim()
    ? "Name cannot be empty"
    : nameTouched && name.trim().length < 2
      ? "Full name must be at least 2 characters"
      : undefined;

  const emailError = emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? "Enter a valid email address"
    : emailTouched && !email.trim()
      ? "Email cannot be empty"
      : undefined;

  const passwordError = passwordTouched && !password
    ? "Password cannot be empty"
    : undefined;

  const nextRequirement = useMemo(() => {
    if (!passwordTouched) return null;
    const unmet = PASSWORD_REQUIREMENTS.find((r) => !r.check(password));
    return unmet?.label ?? null;
  }, [password, passwordTouched]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-950/30 dark:border-red-900/50">
          {error}
        </div>
      )}

      {state === "success" && (
        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3 dark:bg-emerald-950/30 dark:border-emerald-900/50 space-y-2">
          <p>Account created! Redirecting to sign in...</p>
          <p className="font-normal">Check your inbox for a verification email to activate your account.</p>
        </div>
      )}

      <FormField
        label="Enter Full Name"
        name="name"
        type="text"
        autoComplete="name"
        autoFocus={shouldAutoFocus}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onBlur={() => setNameTouched(true)}
        error={nameError}
      />

      <FormField
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        error={emailError}
      />

      <FormField
        label="Choose Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        onFocus={() => setPasswordTouched(true)}
        error={passwordError}
      />

      {nextRequirement && (
        <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">
          {nextRequirement}
        </p>
      )}

      {password.length > 0 && <PasswordStrength password={password} />}

      <Button
        type="submit"
        variant="primary"
        loading={state === "loading"}
        disabled={state === "loading" || state === "success"}
        className="w-full h-12 mt-2"
      >
        {state === "success" ? "Account Created!" : "Create Account"}
      </Button>
    </form>
  );
}
