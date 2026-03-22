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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
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

    if (!acceptedTerms) {
      setShowTermsError(true);
      return;
    }

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
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium transition-all disabled:opacity-50 ${
            acceptedTerms
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "bg-white/30 text-white/60 cursor-not-allowed"
          }`}
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

        {/* Terms checkbox */}
        <label className="flex items-center justify-center gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setShowTermsError(false);
              }}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded border-2 border-white/20 peer-checked:border-white peer-checked:bg-white transition-all flex items-center justify-center">
              {acceptedTerms && (
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-white/40 text-xs leading-relaxed group-hover:text-white/60 transition-colors">
            I agree to the{" "}
            <a href="/terms" className="text-white/70 underline underline-offset-2 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>Terms & Conditions</a>{" "}
            and{" "}
            <a href="/privacy" className="text-white/70 underline underline-offset-2 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
          </span>
        </label>
        {showTermsError && (
          <p className="text-red-400 text-xs animate-pulse text-center">Please accept the Terms & Conditions to continue</p>
        )}
      </div>

      {/* Community Links */}
      <div data-login className="mt-14">
        {/* Animated rainbow line */}
        <div
          className="h-[1.5px] w-full rounded-full mb-8 opacity-70"
          style={{
            background: "linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #24408E, #732982, #E40303)",
            backgroundSize: "200% 100%",
            animation: "rainbowShimmer 4s linear infinite",
          }}
        />

        <p
          className="text-[10px] uppercase tracking-[0.35em] text-center mb-8 font-bold"
          style={{
            background: "linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #24408E, #732982)",
            backgroundSize: "200% 100%",
            animation: "rainbowShimmer 4s linear infinite",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Join Our Community
        </p>

        {/* Social icons row with labels */}
        <div className="flex justify-between items-center px-2 mb-8">
          {[
            { href: "https://www.linkedin.com/company/inblood-com-community/", label: "LinkedIn", color: "#0A66C2", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> },
            { href: "https://www.instagram.com/inblood_community/", label: "Insta", color: "#DD2A7B", gradient: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]", icon: <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/> },
            { href: "https://whatsapp.com/channel/0029Vb8GEUM7IUYUZxE09D3C", label: "WhatsApp", color: "#25D366", icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/> },
            { href: "https://t.me/+byN-nnS76SVmM2I1", label: "Telegram", color: "#26A5E4", icon: <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/> },
            { href: "https://www.facebook.com/inblood.love", label: "Facebook", color: "#1877F2", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
          ].map((social, i) => (
            <a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                style={{
                  background: social.gradient ? undefined : social.color,
                  boxShadow: `0 0 0 rgba(0,0,0,0)`,
                }}
              >
                {social.gradient && <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${social.gradient}`} />}
                <svg className="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">{social.icon}</svg>
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 4px 25px ${social.color}60, 0 0 40px ${social.color}30` }}
                />
              </div>
              <span className="text-white/30 text-[9px] tracking-wider uppercase group-hover:text-white/60 transition-colors">{social.label}</span>
            </a>
          ))}
        </div>

        {/* Private Groups Section */}
        <div className="relative rounded-2xl overflow-hidden mb-4">
          {/* Animated rainbow border */}
          <div
            className="absolute inset-0 rounded-2xl opacity-40"
            style={{
              background: "linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #24408E, #732982, #E40303)",
              backgroundSize: "200% 100%",
              animation: "rainbowShimmer 4s linear infinite",
              padding: "1px",
            }}
          />
          <div className="relative m-[1px] rounded-2xl bg-[#0a0a0a] overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] font-semibold">Private Facebook Groups</p>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {[
                { href: "https://www.facebook.com/share/g/16q5Tu6uTc/", label: "Gay+", desc: "Safe space for gay & queer men", colors: ["#E40303", "#FF8C00"], iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
                { href: "https://www.facebook.com/share/g/1LyzKRumkw/", label: "Lesbian+", desc: "Community for lesbian & queer women", colors: ["#732982", "#E4405F"], iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
                { href: "https://www.facebook.com/share/g/19aKy5qVhW/", label: "Dating", desc: "Find your perfect match", colors: ["#FF8C00", "#E40303"], iconPath: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
              ].map((group, i) => (
                <a
                  key={i}
                  href={group.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.03] transition-all duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${group.colors[0]}25, ${group.colors[1]}25)` }}
                  >
                    <svg className="w-5 h-5" style={{ color: group.colors[0] }} viewBox="0 0 24 24" fill="currentColor"><path d={group.iconPath}/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">{group.label}</span>
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: `linear-gradient(135deg, ${group.colors[0]}30, ${group.colors[1]}30)`, color: group.colors[0] }}
                      >
                        Join
                      </span>
                    </div>
                    <p className="text-white/25 text-[11px] mt-0.5 truncate">{group.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Get the App CTA */}
        <a
          href="https://play.google.com/store/apps/details?id=com.inblood.app&pcampaignid=web_share"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block rounded-2xl overflow-hidden mt-4"
        >
          {/* Animated rainbow background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #24408E, #732982, #E40303)",
              backgroundSize: "200% 100%",
              animation: "rainbowShimmer 4s linear infinite",
              opacity: 0.15,
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #24408E, #732982, #E40303)",
              backgroundSize: "200% 100%",
              animation: "rainbowShimmer 4s linear infinite",
              opacity: 0.3,
            }}
          />
          <div className="relative flex items-center justify-center gap-3 px-6 py-4 backdrop-blur-sm">
            <svg className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4h-.001l-2.49 2.49-2.302-2.302 2.302-2.302 2.49 2.49a.999.999 0 010 1.623zm-3.906-2.808L2.855 2.166l10.937 6.333z"/></svg>
            <div className="flex flex-col">
              <span className="text-white/50 text-[9px] uppercase tracking-widest">Download on</span>
              <span className="text-white text-sm font-bold tracking-wide -mt-0.5">Google Play</span>
            </div>
          </div>
        </a>
      </div>

    </div>
  );
}
