import React, { Suspense } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthContent } from "@/components/auth/AuthContent";

function AuthFallback() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
      <p className="text-slate-600 dark:text-slate-400">Loading...</p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={<AuthFallback />}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
