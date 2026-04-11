"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LegalFooterLinks from "@/components/legal/LegalFooterLinks";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      { text: "Limited daily swipes", included: true },
      { text: "1 Super Like per day", included: true },
      { text: "Basic discovery", included: true },
      { text: "Real-time chat", included: true },
      { text: "Stories", included: true },
      { text: "See who liked you", included: false },
      { text: "Unlimited swipes", included: false },
      { text: "Unlimited super likes", included: false },
      { text: "Priority in discovery", included: false },
    ],
    cta: "Get Started",
    href: "/",
  },
  {
    name: "Premium",
    price: "₹499",
    period: "month",
    featured: true,
    features: [
      { text: "Unlimited swipes", included: true },
      { text: "5 Super Likes per day", included: true },
      { text: "See who liked you", included: true },
      { text: "Advanced discovery filters", included: true },
      { text: "Real-time chat", included: true },
      { text: "Stories", included: true },
      { text: "Priority in discovery", included: true },
      { text: "Read receipts", included: true },
      { text: "Rewind last swipe", included: false },
    ],
    cta: "Upgrade Now",
    href: "/",
  },
  {
    name: "Premium Plus",
    price: "₹2999",
    period: "year",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Unlimited super likes", included: true },
      { text: "Rewind last swipe", included: true },
      { text: "Priority support", included: true },
      { text: "Profile boost monthly", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Exclusive badges", included: true },
      { text: "Early access to features", included: true },
    ],
    cta: "Get Premium Plus",
    href: "/",
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel your subscription at any time from your account settings. No questions asked.",
  },
  {
    q: "Is the free plan really free?",
    a: "Absolutely. Create your profile, swipe, match, and chat — all for free. Premium unlocks additional features.",
  },
  {
    q: "How does Premium Plus save money?",
    a: "Premium Plus is billed annually at ₹2999/year — that's less than ₹250/month compared to ₹499/month on the monthly plan.",
  },
];

export default function PricingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
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
      gsap.from("[data-hero-line]", {
        y: 120,
        rotation: 3,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.08,
        clearProps: "transform,opacity",
      });

      gsap.from("[data-badge]", {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        delay: 0.8,
        ease: "back.out(2)",
        stagger: 0.08,
        clearProps: "transform,opacity",
      });

      gsap.from("[data-faq]", {
        scrollTrigger: { trigger: faqRef.current, start: "top 85%", once: true },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });

      // Footer animations
      gsap.from("[data-footer-big]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 85%", once: true },
        y: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });

      gsap.from("[data-footer-col]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 85%", once: true },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });

      gsap.from("[data-footer-line]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 80%", once: true },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "power3.out",
        clearProps: "transform",
      });

      gsap.from("[data-footer-bottom]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 75%", once: true },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform,opacity",
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
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-[6px]" />
              <Image src="/logo.png" alt="InBlood" width={28} height={28} className="relative z-10 object-contain" />
            </div>
            <span className="text-sm tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}><span className="text-primary">in</span><span className="text-white">Blood</span></span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-[12px] text-white/50 hover:text-white transition-colors hidden sm:block uppercase tracking-[0.15em]">
              About
            </Link>
            <Link href="/" className="text-[12px] text-black bg-white rounded-full px-5 py-2.5 uppercase tracking-[0.15em] font-medium hover:bg-white/90 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="pt-32 pb-12 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <div className="overflow-hidden">
              <h1 data-hero-line className="text-[clamp(3rem,8vw,9rem)] font-black text-white leading-[0.9] tracking-[-0.04em] uppercase">
                Simple,
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 data-hero-line className="text-[clamp(3rem,8vw,9rem)] font-black text-white leading-[0.9] tracking-[-0.04em] uppercase">
                <span className="text-primary">Transparent</span>
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 data-hero-line className="text-[clamp(3rem,8vw,9rem)] font-black text-white leading-[0.9] tracking-[-0.04em] uppercase">
                Pricing.
              </h1>
            </div>
          </div>
          <p data-hero-line className="text-white/40 text-[16px] md:text-[18px] leading-relaxed max-w-lg font-light">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section ref={plansRef} className="py-12 border-t border-white/[0.08]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                data-plan
                className={`group relative bg-white/[0.03] hover:bg-white/[0.06] border transition-all duration-500 rounded-[40px] p-8 md:p-10 flex flex-col ${
                  plan.featured ? "border-primary bg-primary/[0.05]" : "border-white/[0.08]"
                }`}
              >
                {/* Number badge */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <span className="text-[13px] font-bold text-black">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {plan.featured && (
                    <span className="inline-flex items-center gap-2 bg-primary rounded-full px-4 py-1.5">
                      <span className="text-[11px] uppercase tracking-[0.15em] text-white font-medium">Popular</span>
                    </span>
                  )}
                </div>

                {/* Plan name */}
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mb-4 group-hover:text-primary transition-colors duration-500">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                    {plan.price}
                  </span>
                  <span className="text-white/25 text-sm font-medium">/{plan.period}</span>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${feature.included ? "bg-primary" : "bg-white/10"}`} />
                      <span className={`text-[14px] font-light ${feature.included ? "text-white/60" : "text-white/15"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`flex items-center justify-center gap-3 rounded-full py-4 text-[12px] uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                    plan.featured
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "border border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {plan.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="py-20 border-t border-white/[0.08]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 md:gap-24">
            <div>
              <span data-faq className="inline-flex items-center gap-2 border border-white/15 rounded-full px-4 py-1.5 mb-6">
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/50 font-medium">FAQ</span>
              </span>
              <h2 data-faq className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-[0.9]">
                Common<br /><span className="text-primary">Questions</span>
              </h2>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {faqs.map((faq, i) => (
                <div key={i} data-faq className="group py-8 first:pt-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary transition-all duration-500">
                      <span className="text-[11px] font-bold text-white/40 group-hover:text-white transition-colors">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-white tracking-tight mb-3 uppercase">
                        {faq.q}
                      </h4>
                      <p className="text-white/35 text-[15px] leading-relaxed font-light">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="border-t border-white/[0.08] pt-20 pb-10 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">
          <div data-footer-big className="mb-16">
            <h2 className="text-[clamp(4rem,12vw,14rem)] font-black text-white leading-[0.85] tracking-[-0.04em] uppercase select-none">
              In<span className="text-primary">Blood</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-16">
            <div data-footer-col className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-[6px]" />
                  <Image src="/logo.png" alt="InBlood" width={28} height={28} className="relative z-10 object-contain" />
                </div>
                <span className="text-sm tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}><span className="text-primary">in</span><span className="text-white">Blood</span></span>
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

            <div data-footer-col>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-5 font-medium">Legal</p>
              <ul className="space-y-3">
                <LegalFooterLinks />
              </ul>
            </div>

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

          <div data-footer-line className="h-px bg-white/[0.06] mb-8" />

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
