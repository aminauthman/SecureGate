import type { ReactNode } from "react"

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-2xl dark:shadow-black/30 p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base font-normal text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer && (
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
