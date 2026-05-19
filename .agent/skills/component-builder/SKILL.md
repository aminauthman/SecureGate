# SKILL: component-builder

## 1. Objective

Build React functional components using TypeScript and Tailwind CSS that conform to the SecureGate design system (`design-system.md`) and mobile-first principles. Every component must be accessible, responsive down to 320px, and follow the auth-IAM architectural layer conventions.

---

## 2. Scaffolding Command

Generate a new component with this structure:

```text
securegate/
└── components/
    └── auth/
        ├── LoginForm.tsx
        ├── SignUpForm.tsx
        ├── ForgotPasswordForm.tsx
        ├── ResetPasswordForm.tsx
        ├── VerifyEmailCard.tsx
        └── LogoutButton.tsx
```

File naming: `PascalCase.tsx`. Group by domain folder under `components/`.

---

## 3. Component Template

```tsx
interface ComponentProps {
  // Define strict props — no `any`
}

export function ComponentName({ ... }: ComponentProps) {
  return (
    // JSX here
  );
}
```

### Rules
- **No `any` type** — use strict interfaces or `unknown` with guards.
- **No default exports** — always named export.
- **No inline styles** — all styling via Tailwind classes from `design-system.md`.
- **No custom CSS modules** — `design-system.md` tokens cover all cases.

---

## 4. Styling Reference (from design-system.md)

| Concern | Token |
|---|---|
| Page title | `text-2xl font-bold tracking-tight text-slate-900` |
| Body / label text | `text-base font-normal text-slate-600` |
| Error / helper text | `text-sm font-medium text-red-600` |
| Button text | `text-sm font-semibold uppercase tracking-wider` |
| Primary button | `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500` |
| Secondary button | `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50` |
| Ghost button | `text-slate-600 hover:bg-slate-100` |
| Danger button | `bg-red-600 text-white hover:bg-red-700` |
| Link button | `text-blue-600 hover:text-blue-700 underline underline-offset-2` |
| Base input | `w-full px-4 py-3 text-base rounded-md border border-slate-300 text-slate-900 placeholder-slate-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]` |
| Input error | `border-red-500 focus:ring-red-500 focus:border-red-500` |
| Input success | `border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500` |
| Card surface | `bg-white rounded-xl shadow-md p-6 space-y-6` |
| Form page wrapper | `min-h-screen flex items-center justify-center bg-slate-50 px-4` |
| Dark mode card | `dark:bg-slate-800` |
| Dark mode text | `dark:text-slate-100` |
| Disabled state | `disabled:opacity-50 disabled:cursor-not-allowed` |

---

## 5. Accessibility Checklist

Every component must include:

- [ ] `aria-label` on icon-only buttons and inputs without visible labels
- [ ] `aria-describedby` pointing to error/helper text when present
- [ ] `aria-invalid={!!error}` on inputs in error state
- [ ] `role="alert"` on error banners
- [ ] `autocomplete` attributes on form fields (`email`, `current-password`, `new-password`, `one-time-code`)
- [ ] `type` attribute on all inputs (`email`, `password`, `tel`, etc.)
- [ ] Proper `label` element or `aria-labelledby` for every input
- [ ] Focus ring visible on all interactive elements (`focus:ring-2 focus:ring-blue-500`)
- [ ] Touch target minimum `48px` height on all buttons and inputs

---

## 6. Loading & Error States

Every data-driven component must handle these three states:

```tsx
type ViewState = "idle" | "loading" | "error" | "success"

// Loading: disable all inputs, show spinner in submit button
<button disabled className="... disabled:opacity-50 disabled:cursor-not-allowed">
  {state === "loading" ? <Loader2 className="animate-spin" size={4} /> : "Submit"}
</button>

// Error banner
{error && (
  <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
    {error}
  </div>
)}

// Success state
{success && (
  <div className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-3">
    {success}
  </div>
)}
```

---

## 7. Form Field Pattern (reusable)

```tsx
interface FormFieldProps {
  label: string
  name: string
  type: "email" | "password" | "text" | "tel"
  autoComplete: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
}

export function FormField({ label, name, type, autoComplete, value, onChange, error, placeholder }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-base font-normal text-slate-600 dark:text-slate-400">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-4 py-3 text-base font-sans rounded-md border min-h-[48px]
          bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-600"}
          disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm font-medium text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## 8. Button Pattern (reusable)

```tsx
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600",
  ghost: "text-slate-600 hover:bg-slate-100 focus:ring-blue-500 dark:text-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  link: "text-blue-600 hover:text-blue-700 underline underline-offset-2",
}

export function Button({ variant = "primary", loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={4} />}
      {children}
    </button>
  )
}
```

---

## 9. Verification

After generating a component, confirm:

- [ ] `tsc --noEmit` passes (no type errors)
- [ ] ESLint passes (`npm run lint`)
- [ ] No `any` type used
- [ ] All Tailwind classes match `design-system.md` tokens
- [ ] `min-h-[48px]` on all interactive elements
- [ ] `aria-label`, `autocomplete`, `type` set on every input
- [ ] Component scales down to `320px` viewport width
- [ ] Dark mode classes applied (`dark:` variants)
- [ ] Loading, error, and success states handled
- [ ] Named export, no default export
