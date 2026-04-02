"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth.store";

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
    console.log("[AuthGuard] Initializing...");
    _initUnauthorizedHandler();
    restoreSession().then(() => {
      const state = useAuthStore.getState();
      console.log("[AuthGuard] Session restored:", {
        isAuthenticated: state.isAuthenticated,
        hasCompletedProfileSetup: state.hasCompletedProfileSetup,
        hasToken: !!state.accessToken,
        userId: state.userId,
      });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;

    console.log("[AuthGuard] Routing check:", { isAuthenticated, hasCompletedProfileSetup, pathname });

    if (!isAuthenticated) {
      router.replace("/");
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
          <Image src="/logo.png" alt="InBlood" width={64} height={64} className="rounded-xl animate-pulse" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (!hasCompletedProfileSetup && pathname !== "/setup") return null;

  return <>{children}</>;
}
