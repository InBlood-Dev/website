"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Flame } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading,
    hasCompletedOnboarding,
    hasCompletedProfileSetup,
    restoreSession,
    _initUnauthorizedHandler,
  } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    _initUnauthorizedHandler();
    restoreSession().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!hasCompletedProfileSetup && pathname !== "/setup") {
      router.replace("/setup");
      return;
    }
  }, [
    ready,
    isAuthenticated,
    hasCompletedProfileSetup,
    pathname,
    router,
  ]);

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (!hasCompletedProfileSetup && pathname !== "/setup") return null;

  return <>{children}</>;
}
