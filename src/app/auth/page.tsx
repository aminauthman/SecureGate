import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RegisterFormContent } from "@/components/auth/RegisterFormContent";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create Account
          </h1>
          <p className="text-base font-normal text-slate-600 dark:text-slate-400">
            Join the SecureGate IAM Platform
          </p>
        </div>
        <RegisterFormContent />
        <div className="text-center text-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
