import { type ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600",
  ghost:
    "text-slate-600 hover:bg-slate-100 focus:ring-blue-500 dark:text-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  link:
    "text-blue-600 hover:text-blue-700 underline underline-offset-2",
}

export function Button({
  variant = "primary",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className ?? ""}`}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={4} />}
      {children}
    </button>
  )
}
