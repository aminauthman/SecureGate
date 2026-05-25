export const PASSWORD_REQUIREMENTS = [
  { label: "Must contain an uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
  { label: "Must contain a lowercase letter", check: (v: string) => /[a-z]/.test(v) },
  { label: "Must contain a number", check: (v: string) => /[0-9]/.test(v) },
  { label: "Must contain a special character", check: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { label: "Minimum of 12 characters", check: (v: string) => v.length >= 12 },
] as const;

export const PASSWORD_MIN_LENGTH = 12;
