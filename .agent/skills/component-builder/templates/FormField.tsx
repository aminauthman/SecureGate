import { type InputHTMLAttributes } from "react"

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
  name: string
  type: "email" | "password" | "text" | "tel"
  autoComplete: string
  error?: string
}

export function FormField({ label, name, type, autoComplete, error, className, ...props }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="text-base font-normal text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-4 py-3 text-base font-sans rounded-md border min-h-[48px]
          bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-600"}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className ?? ""}`}
        {...props}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm font-medium text-red-600 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
