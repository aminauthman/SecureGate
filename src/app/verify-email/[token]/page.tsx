import React from "react";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import { findVerificationToken, verifyEmail } from "@/lib/services/user";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function VerifyEmailTokenPage({ params }: PageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  try {
    const verificationToken = await findVerificationToken(token);

    if (!verificationToken) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
          <div className="fixed top-4 right-4"><ThemeToggle /></div>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Invalid Link</h1>
            <p className="text-slate-600 dark:text-slate-400">
              This verification link is invalid or has already been used.
            </p>
            <div className="w-full border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-center">
                Enter your email to receive a new verification link:
              </p>
              <ResendVerificationForm />
            </div>
          </div>
        </main>
      );
    }

    if (verificationToken.expires < new Date()) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
          <div className="fixed top-4 right-4"><ThemeToggle /></div>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Link Expired</h1>
            <p className="text-slate-600 dark:text-slate-400">
              This verification link has expired. Verification links are valid for 15 minutes.
            </p>
            <div className="w-full border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-center">
                Resend verification link to your email:
              </p>
              <ResendVerificationForm initialEmail={verificationToken.identifier} />
            </div>
          </div>
        </main>
      );
    }

    await verifyEmail(verificationToken.identifier, verificationToken.id);

    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
        <div className="fixed top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Email Verified</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your email has been successfully verified. You can now access the dashboard.
          </p>
          <Link
            href="/login?verified=true"
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Sign In to Your Account
          </Link>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
        <div className="fixed top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
          <p className="text-slate-600 dark:text-slate-400">
            An unexpected error occurred. Please try again.
          </p>
          <Link
            href="/auth?mode=signin"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Sign In to resend verification
          </Link>
        </div>
      </main>
    );
  }
}
