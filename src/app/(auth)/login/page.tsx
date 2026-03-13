"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedProfileSetup, googleLogin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(hasCompletedProfileSetup ? "/discover" : "/setup");
    }
  }, [isAuthenticated, hasCompletedProfileSetup, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGsiReady(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-login]", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google) return;

    setIsLoading(true);

    console.log("[Login] Initializing Google token client");
    console.log("[Login] Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      scope: "email profile",
      callback: async (response) => {
        console.log("[Login] Google callback received:", {
          hasAccessToken: !!response.access_token,
          error: response.error,
        });

        if (response.error || !response.access_token) {
          console.error("[Login] Google auth failed:", response.error);
          setIsLoading(false);
          return;
        }

        console.log("[Login] Getting location...");
        const location = await new Promise<{ latitude: number; longitude: number } | undefined>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(undefined),
            { timeout: 5000 }
          );
        });
        console.log("[Login] Location:", location);

        console.log("[Login] Calling backend /auth/google/mobile...");
        const success = await googleLogin(response.access_token, location);
        console.log("[Login] Backend login result:", success);
        setIsLoading(false);

        if (success) {
          const { hasCompletedProfileSetup } = useAuthStore.getState();
          console.log("[Login] Redirecting, profileSetup:", hasCompletedProfileSetup);
          router.push(hasCompletedProfileSetup ? "/discover" : "/setup");
        } else {
          console.error("[Login] Backend login returned false");
        }
      },
    });

    console.log("[Login] Requesting access token...");
    client.requestAccessToken();
  };

  return (
    <div ref={containerRef} className="w-full max-w-md relative z-10">
      {/* Back */}
      <Link
        href="/"
        data-login
        className="fixed top-8 left-8 z-50 text-[12px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
      >
        &larr; Home
      </Link>

      <div data-login className="text-center mb-16">
        <Image src="/logo.png" alt="InBlood" width={64} height={64} className="mx-auto mb-8 rounded-2xl" />
        <h1 className="text-4xl font-light text-white tracking-tight mb-3">
          InBlood
        </h1>
        <p className="text-white/30 text-sm font-light">
          Find your match. Start your story.
        </p>
      </div>

      <div data-login className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading || !gsiReady}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-white/15 text-[11px] uppercase tracking-[0.2em]">or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <Link
          href="/onboarding"
          className="block w-full text-center px-6 py-4 border border-white/10 text-white text-sm hover:border-white/25 transition-colors"
        >
          Create an Account
        </Link>
      </div>

      <p data-login className="text-white/15 text-[11px] text-center mt-10 leading-relaxed tracking-wide">
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-white/30 hover:text-white transition-colors">Terms</a>{" "}
        and{" "}
        <a href="/privacy" className="text-white/30 hover:text-white transition-colors">Privacy Policy</a>
      </p>
    </div>
  );
}
