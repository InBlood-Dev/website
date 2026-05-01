"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuthStore } from "@/stores/auth.store";
import Footer from "@/components/layout/Footer";

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

gsap.registerPlugin(ScrollTrigger);

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.inblood.app&pcampaignid=web_share";

function PlayStoreOverlay({ variant = "default" }: { variant?: "default" | "img" }) {
  const groupClass = variant === "img" ? "group-hover/img:opacity-100" : "group-hover:opacity-100";
  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 ${groupClass} transition-opacity duration-300 z-10`}>
      <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#32BBFF" d="M3.999,4.793C3.477,5.342,3.171,6.196,3.171,7.302v33.396c0,1.106,0.305,1.96,0.828,2.509l0.111,0.108L23.034,24.22v-0.44L4.111,4.685L3.999,4.793z"/>
          <path fill="#FFD500" d="M29.336,30.522l-6.302-6.302v-0.44l6.303-6.303l0.142,0.081l7.466,4.243c2.132,1.211,2.132,3.193,0,4.405l-7.466,4.236L29.336,30.522z"/>
          <path fill="#FF3333" d="M29.478,30.441L23.034,24L3.999,43.207c0.703,0.744,1.864,0.836,3.171,0.094L29.478,30.441z"/>
          <path fill="#00C853" d="M29.478,17.559L7.171,4.699C5.864,3.957,4.703,4.049,3.999,4.793L23.034,24L29.478,17.559z"/>
        </svg>
        <span className="text-white text-xs font-bold uppercase tracking-[0.15em]">Get the App</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedProfileSetup, hasCompletedOnboarding, googleLogin } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const orbitLeftRef = useRef<HTMLDivElement>(null);
  const orbitRightRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showTermsError, setShowTermsError] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      if (hasCompletedProfileSetup) {
        router.replace("/discover");
      } else if (!hasCompletedOnboarding) {
        router.replace("/onboarding");
      } else {
        router.replace("/setup");
      }
    }
  }, [isAuthenticated, hasCompletedProfileSetup, hasCompletedOnboarding, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGsiReady(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleGoogleLogin = () => {
    if (!acceptedTerms) {
      setShowTermsError(true);
      return;
    }
    if (!window.google) return;
    setIsLoading(true);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      scope: "email profile",
      callback: async (response) => {
        if (response.error || !response.access_token) {
          setIsLoading(false);
          return;
        }
        const location = await new Promise<{ latitude: number; longitude: number } | undefined>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(undefined),
            { timeout: 5000 }
          );
        });
        const success = await googleLogin(response.access_token, location);
        setIsLoading(false);
        if (success) {
          const { hasCompletedProfileSetup, hasCompletedOnboarding } = useAuthStore.getState();
          if (hasCompletedProfileSetup) {
            router.push("/discover");
          } else if (!hasCompletedOnboarding) {
            router.push("/onboarding");
          } else {
            router.push("/setup");
          }
        }
      },
    });
    client.requestAccessToken();
  };

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = heroRef.current;
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setHeroInView(rect.bottom >= window.innerHeight - 40);
      } else {
        setHeroInView(window.scrollY < 40);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating glow orbs - random smooth movement in bottom-right
      gsap.to("[data-glow-1]", {
        x: "random(-80, 80)",
        y: "random(-60, 60)",
        scale: "random(0.8, 1.2)",
        duration: "random(6, 10)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
      });
      gsap.to("[data-glow-2]", {
        x: "random(-100, 60)",
        y: "random(-50, 70)",
        scale: "random(0.7, 1.3)",
        duration: "random(7, 12)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
      });
      gsap.to("[data-glow-3]", {
        x: "random(-70, 90)",
        y: "random(-80, 50)",
        scale: "random(0.6, 1.4)",
        duration: "random(5, 9)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
      });

      // Hero lines stagger (login section)
      gsap.from("[data-hero-line]", {
        y: 120,
        rotation: 3,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.08,
      });


      // Hero images - pill reveal
      gsap.from("[data-hero-img]", {
        scale: 0,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.15,
      });

      // Badge pills
      gsap.from("[data-badge]", {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        delay: 0.9,
        ease: "back.out(2)",
        stagger: 0.08,
      });

      // Features
      document.querySelectorAll("[data-feature]").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          y: 80,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
        });
      });

      // Feature images
      document.querySelectorAll("[data-feature-img]").forEach((img) => {
        gsap.from(img, {
          scrollTrigger: { trigger: img.closest("[data-feature]"), start: "top 85%" },
          scale: 1.3,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
        });

        gsap.to(img, {
          scrollTrigger: {
            trigger: img.closest("[data-feature]"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
          y: -40,
          ease: "none",
        });
      });

      // CTA
      gsap.from("[data-cta]", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });

      // Marquee
      if (marqueeRef.current) {
        const marquee = marqueeRef.current;
        gsap.to(marquee, {
          xPercent: -50,
          ease: "none",
          duration: 20,
          repeat: -1,
        });
      }


      // Large outline text parallax
      gsap.from("[data-outline-text]", {
        scrollTrigger: { trigger: "[data-outline-text]", start: "top 90%" },
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });

      // Orbiting images around CTA
      if (orbitLeftRef.current) {
        gsap.to(orbitLeftRef.current, {
          rotation: 360,
          duration: 60,
          ease: "none",
          repeat: -1,
        });
      }
      if (orbitRightRef.current) {
        gsap.to(orbitRightRef.current, {
          rotation: -360,
          duration: 70,
          ease: "none",
          repeat: -1,
        });
      }

      // Counter-rotate each image so they stay upright
      document.querySelectorAll("[data-orbit-img]").forEach((img) => {
        const parent = img.closest("[data-orbit-left]") ? "left" : "right";
        gsap.to(img, {
          rotation: parent === "left" ? -360 : 360,
          duration: parent === "left" ? 60 : 70,
          ease: "none",
          repeat: -1,
        });
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Persistent red glow across entire page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full bg-red-600/15 blur-[180px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-[5%] right-[10%] w-[300px] h-[300px] rounded-full bg-red-500/8 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
      </div>

      {/* Hero - Welcome to Adult Community */}
      <section ref={heroRef} className="relative z-[1] min-h-screen flex flex-col justify-center pt-20 pb-12 px-8 md:px-16 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-[center_25%] z-0 scale-125"
        >
          <source src="/images/girls-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col items-center text-center gap-12">
          {/* Eyebrow heading with decorative accent lines */}
          <div className="flex items-center gap-5">
            <span className="h-px w-10 md:w-16 bg-gradient-to-r from-transparent to-white/40" />
            <h1 className="text-2xl font-light whitespace-nowrap">
              <span className="text-white/90">Welcome to</span> <span className="text-primary font-medium">Adult</span> <span className="text-white/90">Community</span>
            </h1>
            <span className="h-px w-10 md:w-16 bg-gradient-to-l from-transparent to-white/40" />
          </div>

          {/* Primary CTA */}
          <a href="https://play.google.com/store/apps/details?id=com.inblood.app&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="laser-btn group relative flex items-center justify-center gap-3 px-10 py-6 text-base font-bold rounded-2xl uppercase tracking-[0.15em] bg-black border border-primary/40 text-primary hover:border-primary hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-300 overflow-hidden min-w-[360px]">
            <svg className="w-6 h-6 relative z-10" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#32BBFF" d="M3.999,4.793C3.477,5.342,3.171,6.196,3.171,7.302v33.396c0,1.106,0.305,1.96,0.828,2.509l0.111,0.108L23.034,24.22v-0.44L4.111,4.685L3.999,4.793z"/>
              <path fill="#FFD500" d="M29.336,30.522l-6.302-6.302v-0.44l6.303-6.303l0.142,0.081l7.466,4.243c2.132,1.211,2.132,3.193,0,4.405l-7.466,4.236L29.336,30.522z"/>
              <path fill="#FF3333" d="M29.478,30.441L23.034,24L3.999,43.207c0.703,0.744,1.864,0.836,3.171,0.094L29.478,30.441z"/>
              <path fill="#00C853" d="M29.478,17.559L7.171,4.699C5.864,3.957,4.703,4.049,3.999,4.793L23.034,24L29.478,17.559z"/>
            </svg>
            <span className="relative z-10">Download the App</span>
          </a>

          {/* Supporting micro-copy */}
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-light -mt-4">
            Free · Available on Google Play
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="hero-login" className="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-16 overflow-hidden">

        {/* Background marquees */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-6 md:gap-10">
          <div className="overflow-hidden">
            <div className="flex whitespace-nowrap animate-[marqueeLeft_60s_linear_infinite] will-change-transform">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i} className="text-[14vw] md:text-[10vw] font-black uppercase tracking-tighter leading-none text-white/[0.04] px-6">
                  Connect · Love · Belong · Explore · Match · Community ·
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex whitespace-nowrap animate-[marqueeRight_75s_linear_infinite] will-change-transform" style={{ transform: "translateX(-50%)" }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i} className="text-[16vw] md:text-[12vw] font-black uppercase tracking-tighter leading-none px-6"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.18), transparent)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                  inBlood · inBlood · inBlood · inBlood ·
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex whitespace-nowrap animate-[marqueeLeft_90s_linear_infinite] will-change-transform">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i} className="text-[14vw] md:text-[10vw] font-black uppercase tracking-tighter leading-none text-white/[0.03] px-6 italic">
                  Pride · Authentic · Safe · Real · Together · Free ·
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg relative z-10">

          {/* Glass card */}
          <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl p-8 md:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
            {/* Subtle inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />

            <div data-hero-line className="relative space-y-6">
              <div className="text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70 font-medium">Sign in</p>
                <p className="text-white text-2xl md:text-3xl font-light leading-tight">
                  Explore, connect, and<br />find your <span className="text-primary font-medium">match</span>
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading || !gsiReady}
                className={`group relative w-full flex items-center justify-center gap-3 px-6 py-5 text-sm font-bold rounded-2xl uppercase tracking-[0.15em] transition-all duration-300 disabled:opacity-50 overflow-hidden ${
                  acceptedTerms
                    ? "bg-black border border-primary/40 text-primary hover:border-primary hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                    : "bg-black/50 border border-white/10 text-white/40 cursor-not-allowed"
                }`}
              >
                {acceptedTerms && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill={acceptedTerms ? "#dc2626" : "#666"} />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={acceptedTerms ? "#ff4444" : "#555"} />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={acceptedTerms ? "#b91c1c" : "#555"} />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={acceptedTerms ? "#ef4444" : "#666"} />
                  </svg>
                )}
                <span className="relative z-10">Continue with Google</span>
              </button>

              {/* Terms checkbox */}
              <label className="flex items-start justify-center gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
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

            {/* Divider */}
            <div className="relative my-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium">Join the community</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
            </div>

            {/* Social icons row */}
            <div data-hero-line className="grid grid-cols-5 gap-3 md:gap-4">
              {[
                { href: "https://www.linkedin.com/company/inblood-com/posts/?feedView=all", label: "LinkedIn", color: "#0A66C2", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> },
                { href: "https://www.instagram.com/inblood_community/", label: "Insta", color: "#DD2A7B", gradient: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]", icon: <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/> },
                { href: "https://whatsapp.com/channel/0029VbCiUaNJf05WMHQji23u", label: "WhatsApp", color: "#25D366", icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/> },
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
                    className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: social.gradient ? undefined : social.color,
                    }}
                  >
                    {social.gradient && <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${social.gradient}`} />}
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">{social.icon}</svg>
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: `0 4px 25px ${social.color}60, 0 0 40px ${social.color}30` }}
                    />
                  </div>
                  <span className="text-white/30 text-[9px] md:text-[10px] tracking-wider uppercase group-hover:text-white/70 transition-colors">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* Features - editorial magazine spread */}
      <section ref={featuresRef} className="relative z-[1] py-12">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">

          {/* --- Row 1: Full width hero --- */}
          <div data-feature className="mb-2 md:mb-3">
            <h2 className="text-[clamp(1.5rem,6vw,7rem)] font-black text-white leading-[0.9] tracking-[-0.03em] uppercase mb-2 md:mb-4">
              Everything<br />You <span className="text-primary">Need</span>
            </h2>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download InBlood on Google Play" className="relative group block h-[250px] sm:h-[350px] md:h-[500px] overflow-hidden cursor-pointer">
              <Image src="/images/hero-pride.png" alt="Celebrating Love" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
                <p className="text-white/80 text-[14px] sm:text-[18px] md:text-[22px] font-medium leading-snug">Celebrating love in all its beautiful forms. A safe space to be yourself, connect, and find your people.</p>
              </div>
              <PlayStoreOverlay />
            </a>
          </div>

          {/* --- Row 2: Asymmetric spread --- */}
          <div data-feature className="grid grid-cols-[1fr_1.2fr] gap-2 md:gap-3 mb-2 md:mb-3">
            {/* Left: tall image */}
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download InBlood on Google Play" className="relative group overflow-hidden h-[250px] sm:h-[350px] md:h-[500px] cursor-pointer block">
              <Image src="/images/girls.png" alt="Nearby Discovery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 45vw, 45vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6">
                <p className="text-white/70 text-[13px] sm:text-[16px] md:text-[20px] font-medium leading-snug mb-1 md:mb-2">Nearby Discovery</p>
                <p className="text-white/40 text-[11px] sm:text-[13px] md:text-[15px] font-light leading-relaxed hidden sm:block">Find people close to you with location-based discovery.</p>
              </div>
              <PlayStoreOverlay />
            </a>

            {/* Right: card + image combo */}
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="bg-[#131313] rounded-xl md:rounded-2xl p-3 md:p-6 group">
                <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-full overflow-hidden relative shrink-0">
                    <Image src="/images/couple3.jpg" alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="text-white text-[11px] md:text-[15px] font-bold uppercase tracking-wide">InBlood</p>
                    <p className="text-white/30 text-[9px] md:text-[12px]">@inblood &bull; verified</p>
                  </div>
                </div>
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download InBlood on Google Play" className="relative h-[120px] sm:h-[180px] md:h-[220px] overflow-hidden rounded-lg md:rounded-xl block group/img cursor-pointer">
                  <Image src="/images/boys.png" alt="Safe & Verified" fill className="object-cover transition-transform duration-700 group-hover/img:scale-105" sizes="(max-width: 768px) 55vw, 50vw" />
                  <PlayStoreOverlay variant="img" />
                </a>
                <p className="text-white/40 text-[11px] sm:text-[13px] md:text-[15px] font-light mt-2 md:mt-4 leading-relaxed">
                  Verify your profile, block unwanted contacts, and enjoy a safe dating experience.
                </p>
              </div>
            </div>
          </div>

          {/* --- Row 3: Final spread --- */}
          <div data-feature className="grid grid-cols-[1fr_1.1fr] gap-2 md:gap-3">
            {/* Left: large text + description */}
            <div className="flex flex-col justify-center">
              <h3 className="text-[clamp(1.3rem,5vw,5rem)] font-black text-white leading-[0.95] tracking-[-0.03em] uppercase mb-2 md:mb-4">
                Share Your<br /><span className="text-primary">Stories</span><br />Discover More
              </h3>
              <p className="text-white/40 text-[11px] sm:text-[14px] md:text-[18px] font-light leading-relaxed max-w-md">
                Post photos and videos that disappear in 24 hours. Unlock unlimited swipes, see who likes you, and much more with Premium.
              </p>
            </div>

            {/* Right: image */}
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download InBlood on Google Play" className="relative group block cursor-pointer">
              <div className="relative h-[280px] sm:h-[400px] md:h-[600px] overflow-hidden">
                <Image src="/images/menwithcat.png" alt="Premium Features" fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 55vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <PlayStoreOverlay />
              </div>
            </a>
          </div>

        </div>
      </section>

      {/* CTA Section with orbiting images */}
      <section ref={ctaRef} className="relative z-[1] py-40 md:py-52">
        {/* Left orbit */}
        <div className="absolute left-[-350px] md:left-[-280px] top-[25%] -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none">
          <div ref={orbitLeftRef} data-orbit-left className="relative w-full h-full">
            {[
              { src: "/images/marquee1.png", size: "w-24 h-24 md:w-32 md:h-32", pos: "top-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/marquee2.png", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[15%] right-[5%]", blur: true },
              { src: "/images/marquee3.png", size: "w-18 h-18 md:w-24 md:h-24", pos: "top-[45%] right-0", blur: false },
              { src: "/images/marquee4.png", size: "w-24 h-24 md:w-30 md:h-30", pos: "bottom-[15%] right-[10%]", blur: true },
              { src: "/images/marquee5.png", size: "w-20 h-20 md:w-28 md:h-28", pos: "bottom-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/marquee6.png", size: "w-18 h-18 md:w-24 md:h-24", pos: "bottom-[20%] left-[5%]", blur: true },
              { src: "/images/marquee7.png", size: "w-22 h-22 md:w-30 md:h-30", pos: "top-[40%] left-0", blur: false },
              { src: "/images/marquee8.png", size: "w-16 h-16 md:w-20 md:h-20", pos: "top-[18%] left-[8%]", blur: true },
            ].map((item, i) => (
              <div key={i} data-orbit-img className={`absolute ${item.pos} ${item.size} rounded-full overflow-hidden shadow-lg shadow-black/30 ${item.blur ? "blur-[2px] opacity-50" : "opacity-80"}`}>
                <Image src={item.src} alt="" fill className="object-cover" sizes="130px" />
              </div>
            ))}
          </div>
        </div>

        {/* Right orbit */}
        <div className="absolute right-[-350px] md:right-[-280px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none">
          <div ref={orbitRightRef} data-orbit-right className="relative w-full h-full">
            {[
              { src: "/images/marquee9.png", size: "w-24 h-24 md:w-32 md:h-32", pos: "top-0 left-1/2 -translate-x-1/2", blur: true },
              { src: "/images/marquee10.png", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[12%] left-[5%]", blur: false },
              { src: "/images/marquee11.png", size: "w-18 h-18 md:w-24 md:h-24", pos: "top-[42%] left-0", blur: true },
              { src: "/images/marquee12.png", size: "w-22 h-22 md:w-30 md:h-30", pos: "bottom-[18%] left-[8%]", blur: false },
              { src: "/images/marquee13.png", size: "w-24 h-24 md:w-30 md:h-30", pos: "bottom-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/marquee14.png", size: "w-18 h-18 md:w-24 md:h-24", pos: "bottom-[15%] right-[5%]", blur: true },
              { src: "/images/marquee15.png", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[45%] right-0", blur: false },
              { src: "/images/marquee16.png", size: "w-16 h-16 md:w-20 md:h-20", pos: "top-[15%] right-[8%]", blur: true },
              { src: "/images/marquee17.png", size: "w-20 h-20 md:w-24 md:h-24", pos: "bottom-[30%] right-[15%]", blur: false },
            ].map((item, i) => (
              <div key={i} data-orbit-img className={`absolute ${item.pos} ${item.size} rounded-full overflow-hidden shadow-lg shadow-black/30 ${item.blur ? "blur-[2px] opacity-50" : "opacity-80"}`}>
                <Image src={item.src} alt="" fill className="object-cover" sizes="130px" />
              </div>
            ))}
          </div>
        </div>


        {/* CTA content */}
        <div className="relative z-20 max-w-[800px] mx-auto px-8 md:px-16 text-center">
          <h2 data-cta className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight uppercase leading-[0.9] mb-8">
            Ready to<br />Find Your <span className="text-primary">Match</span>?
          </h2>
          <p data-cta className="text-white/35 text-[16px] md:text-[18px] leading-relaxed font-light max-w-lg mx-auto mb-10">
            Join thousands of people who are already finding meaningful
            connections on InBlood.
          </p>
          <div data-cta className="flex gap-3 flex-wrap justify-center">
            <a href="#hero-login" className="rounded-full px-10 py-4 bg-primary text-white text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-primary-dark transition-colors">
              Start Now &mdash; It&apos;s Free
            </a>
            <a href="#hero-login" className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://whatsapp.com/channel/0029VbCiUaNJf05WMHQji23u"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40"
        style={{
          transform: heroInView ? "translateX(0)" : "translateX(200px)",
          opacity: heroInView ? 1 : 0,
          pointerEvents: heroInView ? "auto" : "none",
          visibility: heroInView ? "visible" : "hidden",
          transition: heroInView
            ? "transform 500ms ease-out, opacity 500ms ease-out, visibility 0s linear 0s"
            : "transform 500ms ease-in, opacity 500ms ease-in, visibility 0s linear 500ms",
        }}
        aria-hidden={!heroInView}
        tabIndex={heroInView ? 0 : -1}
        aria-label="WhatsApp"
      >
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
