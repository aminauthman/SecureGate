"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DashboardPage() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              SecureGate Dashboard
            </h1>
              <p className="text-base font-normal text-slate-600 dark:text-slate-400">
              Enterprise Identity & Access Management Control Console
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              System Overview
            </h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800">
            <p className="text-base font-normal text-slate-600 dark:text-slate-400">
                Authentication services are fully operational. Access tokens are being managed securely under the strict parameters defined in the IAM perimeter schema.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Session Integrity
            </h2>
            <p className="text-sm font-normal text-slate-600 dark:text-slate-400">
              Your session is active and monitored against standard idle limits. All credential checks adhere to constant-time Bcrypt execution tracks.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
