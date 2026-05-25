"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get("verified");
    const dest = verified ? `/auth?mode=signin&verified=${verified}` : "/auth?mode=signin";
    router.replace(dest);
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <p className="text-slate-600 dark:text-slate-400">Redirecting...</p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">Redirecting...</p>
      </main>
    }>
      <LoginRedirect />
    </Suspense>
  );
}
