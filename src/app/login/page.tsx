import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginPageContent />
    </main>
  );
}
