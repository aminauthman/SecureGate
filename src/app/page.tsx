
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg p-6 space-y-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome to SecureGate
        </h1>
        <p className="text-base font-normal text-slate-600 dark:text-slate-400">
          The isolated, highly secure Identity & Access Management (IAM) reference layer.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
