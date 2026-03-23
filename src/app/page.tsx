"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    num: "01",
    title: "Swipe & Match",
    description:
      "Discover amazing people near you. Like, pass, or super like — when the feeling is mutual, it's a match!",
    image: "/images/couple1.jpg",
  },
  {
    num: "02",
    title: "Real-time Chat",
    description:
      "Message your matches instantly with typing indicators, read receipts, and media sharing.",
    image: "/images/couple2.jpg",
  },
  {
    num: "03",
    title: "Nearby Discovery",
    description:
      "Find people close to you with our location-based discovery. See who's active nearby.",
    image: "/images/feature1.jpg",
  },
  {
    num: "04",
    title: "Safe & Verified",
    description:
      "Verify your profile, block unwanted contacts, and enjoy a safe dating experience.",
    image: "/images/feature2.jpg",
  },
  {
    num: "05",
    title: "Stories",
    description:
      "Share moments from your day. Post photos and videos that disappear in 24 hours.",
    image: "/images/couple3.jpg",
  },
  {
    num: "06",
    title: "Premium Features",
    description:
      "Unlock unlimited swipes, see who likes you, super likes, and much more with Premium.",
    image: "/images/about.jpg",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const orbitLeftRef = useRef<HTMLDivElement>(null);
  const orbitRightRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setNavHidden(currentY > 100 && currentY > lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

      // Hero lines stagger
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

      // Stats
      gsap.from("[data-stat]", {
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
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

      // Hero parallax
      gsap.to("[data-hero-content]", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: -100,
        opacity: 0,
      });

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

      // Footer animations
      gsap.from("[data-footer-big]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 85%" },
        y: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.from("[data-footer-col]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from("[data-footer-line]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 70%" },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "power3.out",
      });

      gsap.from("[data-footer-bottom]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 65%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 animate-[navSlide_0.8s_ease-out_both] ${navHidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-20 px-8 md:px-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute -inset-2 rounded-full bg-red-500/40 blur-[12px] animate-pulse" />
              <div className="absolute -inset-1 rounded-full bg-primary/30 blur-[6px]" />
              <Image src="/logo.png" alt="InBlood" width={28} height={28} className="relative z-10 object-contain" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-[0.15em]">InBlood</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-[12px] text-white/50 hover:text-white transition-colors hidden sm:block uppercase tracking-[0.15em]">
              About
            </Link>
            <Link href="/pricing" className="text-[12px] text-white/50 hover:text-white transition-colors hidden sm:block uppercase tracking-[0.15em]">
              Pricing
            </Link>
            <Link href="/login" className="text-[12px] text-black bg-white rounded-full px-5 py-2.5 uppercase tracking-[0.15em] font-medium hover:bg-white/90 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-20 pb-12 px-8 md:px-16">
        {/* Red glow - bottom right, animated */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div data-glow-1 className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full bg-red-600/20 blur-[180px]" />
          <div data-glow-2 className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-primary/15 blur-[140px]" />
          <div data-glow-3 className="absolute bottom-[5%] right-[10%] w-[300px] h-[300px] rounded-full bg-red-500/10 blur-[120px]" />
        </div>
        {/* Grain/noise overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />

        <div data-hero-content className="max-w-[1400px] mx-auto w-full relative z-10">
          {/* Large Typography Block */}
          <div className="mb-12">
            <div className="overflow-hidden">
              <h1 data-hero-line className="text-[clamp(3.5rem,10vw,11rem)] font-black text-white leading-[0.9] tracking-[-0.04em] uppercase">
                <span className="text-primary">Find Your</span>
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 data-hero-line className="text-[clamp(3.5rem,10vw,11rem)] font-black text-white leading-[0.9] tracking-[-0.04em] uppercase">
                Perfect
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 data-hero-line className="text-[clamp(3.5rem,10vw,11rem)] font-black text-white leading-[0.9] tracking-[-0.04em] uppercase">
                <span className="text-primary">Match</span> Today.
              </h1>
            </div>
          </div>

          {/* Badge row */}
          <div className="flex items-center gap-4 mb-10 flex-wrap">
            <span data-badge className="inline-flex items-center gap-2 border border-white/20 rounded-full px-5 py-2">
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/70 font-medium">LGBTQ+</span>
            </span>
            <span data-badge className="inline-flex items-center gap-2 bg-white/[0.06] rounded-full px-5 py-2">
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/70 font-medium">Dating Platform</span>
            </span>
          </div>

          {/* Pill-shaped images row */}
          <div className="flex items-end gap-4 md:gap-6 mb-12">
            <div data-hero-img className="relative w-[140px] md:w-[200px] h-[90px] md:h-[120px] rounded-full overflow-hidden shrink-0">
              <Image src="/images/couple1.jpg" alt="Couple" fill className="object-cover" sizes="200px" />
            </div>
            <div data-hero-img className="relative w-[140px] md:w-[200px] h-[90px] md:h-[120px] rounded-full overflow-hidden shrink-0">
              <Image src="/images/couple2.jpg" alt="Couple" fill className="object-cover" sizes="200px" />
            </div>

            {/* Arrow link circle */}
            <Link href="/onboarding" data-hero-img className="w-[90px] md:w-[120px] h-[90px] md:h-[120px] rounded-full bg-primary flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </Link>
          </div>

          {/* Bottom info row */}
          <div className="flex items-start justify-between flex-wrap gap-8">
            <p data-hero-line className="text-white/40 text-[16px] md:text-[18px] leading-relaxed max-w-md font-light">
              InBlood is a modern dating platform that helps you find meaningful
              connections with people who share your passions.
            </p>
            <div data-hero-line className="flex gap-3">
              <Link href="/onboarding" className="rounded-full px-8 py-3.5 bg-white text-black text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-white/90 transition-colors">
                Get Started
              </Link>
              <Link href="/login" className="rounded-full px-8 py-3.5 border border-white/20 text-white text-[12px] uppercase tracking-[0.15em] font-medium hover:border-white/50 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </div>
        </div>
      </section>

      {/* Stats - horizontal with large numbers */}
      <section ref={statsRef} className="py-20 border-t border-white/[0.08]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "10K+", label: "Matches Made" },
              { value: "4.8", label: "App Rating" },
            ].map((stat, i) => (
              <div key={stat.label} data-stat className="group text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-[11px] font-mono text-white/20">{String(i + 1).padStart(2, "0")}</span>
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-[clamp(2.5rem,6vw,7rem)] font-black text-white tracking-tighter leading-none mb-2">
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - editorial magazine spread */}
      <section ref={featuresRef} className="py-12 border-t border-white/[0.08]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">

          {/* --- Row 1: Hero spread --- */}
          <div data-feature className="grid md:grid-cols-[1.3fr_1fr] gap-3 mb-3">
            {/* Left: large title + big image */}
            <div className="relative group">
              <h2 className="text-[clamp(2.5rem,6vw,7rem)] font-black text-white leading-[0.9] tracking-[-0.03em] uppercase mb-4">
                Everything<br />You <span className="text-primary">Need</span>
              </h2>
              <div className="relative h-[300px] md:h-[420px] overflow-hidden">
                <Image src="/images/couple1.jpg" alt="Swipe & Match" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 55vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/70 text-[18px] md:text-[20px] font-medium leading-snug">Swipe, match, and connect with amazing people near you.</p>
                </div>
              </div>
            </div>

            {/* Right: stacked images + info card */}
            <div className="flex flex-col gap-3">
              <div className="relative group h-[200px] md:h-[260px] overflow-hidden">
                <Image src="/images/couple2.jpg" alt="Real-time Chat" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-white/70 text-[16px] md:text-[18px] font-medium leading-snug">Real-time chat with typing indicators and read receipts.</p>
                </div>
              </div>
              <div className="relative group flex-1 min-h-[160px] overflow-hidden bg-[#131313] p-6 md:p-8 flex flex-col justify-center">
                <p className="text-[12px] uppercase tracking-[0.2em] text-white/30 mb-3">Features</p>
                <p className="text-white/60 text-[18px] md:text-[20px] font-medium leading-snug mb-3">Discover amazing people near you. Like, pass, or super like.</p>
                <p className="text-white/40 text-[15px] md:text-[16px] font-light leading-relaxed">Message your matches instantly with media sharing, stories, and more.</p>
              </div>
            </div>
          </div>

          {/* --- Row 2: Asymmetric spread --- */}
          <div data-feature className="grid md:grid-cols-[1fr_1.2fr] gap-3 mb-3">
            {/* Left: tall image */}
            <div className="relative group overflow-hidden h-[350px] md:h-[500px]">
              <Image src="/images/feature1.jpg" alt="Nearby Discovery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 45vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/70 text-[18px] md:text-[20px] font-medium leading-snug mb-2">Nearby Discovery</p>
                <p className="text-white/40 text-[15px] font-light leading-relaxed">Find people close to you with location-based discovery.</p>
              </div>
            </div>

            {/* Right: card + image combo */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#131313] rounded-2xl p-6 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
                    <Image src="/images/couple3.jpg" alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="text-white text-[15px] font-bold uppercase tracking-wide">InBlood</p>
                    <p className="text-white/30 text-[12px]">@inblood &bull; verified &bull; online now</p>
                  </div>
                </div>
                <div className="relative h-[180px] md:h-[220px] overflow-hidden rounded-xl">
                  <Image src="/images/feature2.jpg" alt="Safe & Verified" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <p className="text-white/40 text-[15px] font-light mt-4 leading-relaxed">
                  Verify your profile, block unwanted contacts, and enjoy a safe dating experience. Safety is our top priority.
                </p>
              </div>
            </div>
          </div>

          {/* --- Row 3: Final spread --- */}
          <div data-feature className="grid md:grid-cols-[1fr_1.1fr] gap-3">
            {/* Left: large text + description */}
            <div className="flex flex-col justify-center">
              <h3 className="text-[clamp(2rem,5vw,5rem)] font-black text-white leading-[0.95] tracking-[-0.03em] uppercase mb-4">
                Share Your<br /><span className="text-primary">Stories</span><br />Discover More
              </h3>
              <p className="text-white/40 text-[16px] md:text-[18px] font-light leading-relaxed max-w-md">
                Post photos and videos that disappear in 24 hours. Unlock unlimited swipes, see who likes you, and much more with Premium.
              </p>
            </div>

            {/* Right: image */}
            <div className="relative group">
              <div className="relative h-[350px] md:h-[460px] overflow-hidden">
                <Image src="/images/about.jpg" alt="Premium Features" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Large Outline Text - decorative */}
      <section className="py-10 overflow-hidden">
        <div data-outline-text className="whitespace-nowrap flex items-center gap-8" ref={marqueeRef}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[clamp(6rem,15vw,14rem)] font-black uppercase tracking-tight leading-none select-none" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.08)", color: "transparent" }}>
              InBlood &bull; Find Your Match &bull;
            </span>
          ))}
        </div>
      </section>

      {/* CTA Section with orbiting images */}
      <section ref={ctaRef} className="relative py-40 md:py-52 border-t border-white/[0.08] overflow-hidden">
        {/* Left orbit */}
        <div className="absolute left-[-350px] md:left-[-280px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none">
          <div ref={orbitLeftRef} data-orbit-left className="relative w-full h-full">
            {[
              { src: "/images/couple1.jpg", size: "w-24 h-24 md:w-32 md:h-32", pos: "top-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/couple2.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[15%] right-[5%]", blur: true },
              { src: "/images/feature1.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "top-[45%] right-0", blur: false },
              { src: "/images/feature2.jpg", size: "w-24 h-24 md:w-30 md:h-30", pos: "bottom-[15%] right-[10%]", blur: true },
              { src: "/images/couple3.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "bottom-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/about.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "bottom-[20%] left-[5%]", blur: true },
              { src: "/images/hero.jpg", size: "w-22 h-22 md:w-30 md:h-30", pos: "top-[40%] left-0", blur: false },
              { src: "/images/cta.jpg", size: "w-16 h-16 md:w-20 md:h-20", pos: "top-[18%] left-[8%]", blur: true },
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
              { src: "/images/couple2.jpg", size: "w-24 h-24 md:w-32 md:h-32", pos: "top-0 left-1/2 -translate-x-1/2", blur: true },
              { src: "/images/feature1.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[12%] left-[5%]", blur: false },
              { src: "/images/couple1.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "top-[42%] left-0", blur: true },
              { src: "/images/about.jpg", size: "w-22 h-22 md:w-30 md:h-30", pos: "bottom-[18%] left-[8%]", blur: false },
              { src: "/images/hero.jpg", size: "w-24 h-24 md:w-30 md:h-30", pos: "bottom-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/cta.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "bottom-[15%] right-[5%]", blur: true },
              { src: "/images/couple3.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[45%] right-0", blur: false },
              { src: "/images/feature2.jpg", size: "w-16 h-16 md:w-20 md:h-20", pos: "top-[15%] right-[8%]", blur: true },
            ].map((item, i) => (
              <div key={i} data-orbit-img className={`absolute ${item.pos} ${item.size} rounded-full overflow-hidden shadow-lg shadow-black/30 ${item.blur ? "blur-[2px] opacity-50" : "opacity-80"}`}>
                <Image src={item.src} alt="" fill className="object-cover" sizes="130px" />
              </div>
            ))}
          </div>
        </div>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

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
            <Link href="/onboarding" className="rounded-full px-10 py-4 bg-primary text-white text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-primary-dark transition-colors">
              Start Now &mdash; It&apos;s Free
            </Link>
            <Link href="/onboarding" className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="border-t border-white/[0.08] pt-20 pb-10 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">

          {/* Big InBlood text */}
          <div data-footer-big className="mb-16">
            <h2 className="text-[clamp(4rem,12vw,14rem)] font-black text-white leading-[0.85] tracking-[-0.04em] uppercase select-none">
              In<span className="text-primary">Blood</span>
            </h2>
          </div>

          {/* Main footer grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-16">

            {/* Col 1: Logo + tagline */}
            <div data-footer-col className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <div className="absolute -inset-2 rounded-full bg-red-500/40 blur-[12px] animate-pulse" />
                  <div className="absolute -inset-1 rounded-full bg-primary/30 blur-[6px]" />
                  <Image src="/logo.png" alt="InBlood" width={28} height={28} className="relative z-10 object-contain" />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-[0.15em]">InBlood</span>
              </div>
              <p className="text-white/30 text-[13px] font-light leading-relaxed max-w-[240px] mb-6">
                A modern dating platform built for people who value genuine connections.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div data-footer-col>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-5 font-medium">Navigate</p>
              <ul className="space-y-3">
                {[
                  { label: "Home", href: "/" },
                  { label: "About", href: "/about" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Discover", href: "/discover" },
                  { label: "Premium", href: "/premium" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/35 text-[13px] hover:text-white transition-colors duration-300 font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Legal */}
            <div data-footer-col>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-5 font-medium">Legal</p>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookie-policy" },
                  { label: "Safety Tips", href: "/safety-tips" },
                  { label: "Community Guidelines", href: "/community-guidelines" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/35 text-[13px] hover:text-white transition-colors duration-300 font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Get the App */}
            <div data-footer-col>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-5 font-medium">Get The App</p>
              <p className="text-white/30 text-[13px] font-light leading-relaxed mb-5">
                Download InBlood and start matching today.
              </p>
              <div className="flex flex-col gap-3">
                <a href="#" className="group flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 rounded-xl px-4 py-3 transition-all duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="opacity-50 group-hover:opacity-80 transition-opacity shrink-0"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-white/30 leading-none">Download on the</p>
                    <p className="text-white/70 text-[13px] font-medium leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" className="group flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 rounded-xl px-4 py-3 transition-all duration-300">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="white" className="opacity-50 group-hover:opacity-80 transition-opacity shrink-0"><path d="M0.6 0.418C0.216 0.818 0 1.418 0 2.168v15.64c0 0.75 0.216 1.35 0.6 1.75l0.09 0.09L10.44 10l-0.09-0.09L0.6 0.418z"/><path d="M13.72 13.28L10.44 10l3.28-3.28 3.7 2.13c1.06 0.6 1.06 1.58 0 2.18l-3.7 2.25z"/><path d="M13.72 13.28L10.44 10 0.69 19.56c0.35 0.37 0.92 0.42 1.58 0.05l11.45-6.33z"/><path d="M13.72 6.72L2.27 0.39C1.61 0.02 1.04 0.07 0.69 0.44L10.44 10l3.28-3.28z"/></svg>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-white/30 leading-none">Get it on</p>
                    <p className="text-white/70 text-[13px] font-medium leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Divider line */}
          <div data-footer-line className="h-px bg-white/[0.06] mb-8" />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p data-footer-bottom className="text-[11px] text-white/15 tracking-wider">
              &copy; {new Date().getFullYear()} InBlood. All rights reserved.
            </p>
            <div data-footer-bottom className="flex items-center gap-6">
              <span className="text-[11px] text-white/15 tracking-wider">Designed with love</span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[11px] text-white/15 tracking-wider">Made for everyone</span>
            </div>
            <button
              data-footer-bottom
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-white/5 transition-all duration-300 group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-60 transition-opacity"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
