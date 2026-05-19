import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params.error as string | undefined;
  const success = params.success as string | undefined;

  let title: string;
  let message: string;
  let isError: boolean;

  if (success === "true") {
    title = "Email Verified";
    message = "Your email has been successfully verified. You can now sign in to your account.";
    isError = false;
  } else if (error === "missing-token") {
    title = "Invalid Link";
    message = "No verification token was provided. Please use the full link from your email.";
    isError = true;
  } else if (error === "invalid-token") {
    title = "Invalid Link";
    message = "This verification link is invalid or has already been used. Please request a new one.";
    isError = true;
  } else if (error === "expired-token") {
    title = "Link Expired";
    message = "This verification link has expired. Please request a new one.";
    isError = true;
  } else {
    title = "Verification Failed";
    message = "An unexpected error occurred. Please try again.";
    isError = true;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isError ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}`}>
          {isError ? (
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-base font-normal text-slate-600 dark:text-slate-400">
            {message}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>

        {isError && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need a new verification link?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
              Sign in to resend
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
