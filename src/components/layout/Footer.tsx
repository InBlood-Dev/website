"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LegalFooterLinks from "@/components/legal/LegalFooterLinks";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-footer-big]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 85%" },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from("[data-footer-col]", {
        scrollTrigger: { trigger: footerRef.current, start: "top 80%" },
        y: 40,
        opacity: 0,
        duration: 0.8,
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
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative z-[1] border-t border-white/[0.08] pt-10 md:pt-14 pb-6 md:pb-8 px-4 sm:px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 mb-8 md:mb-10">

          {/* Col 1: Big logo + tagline + socials + nav + legal */}
          <div data-footer-col>
            <div data-footer-big className="mb-6 md:mb-8">
              <h2 className="text-[clamp(5rem,13vw,13rem)] leading-[0.85] tracking-[-0.05em] select-none" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
                <span className="text-primary">in</span><span className="text-white">Blood</span>
              </h2>
            </div>
            <p className="text-white/60 text-[16px] md:text-[17px] font-light leading-relaxed max-w-[420px] mb-6">
              A modern dating platform built for people who value genuine connections.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.facebook.com/inblood.love" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-60 group-hover:opacity-100 transition-opacity"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/inblood_community/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-60 group-hover:opacity-100 transition-opacity"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://whatsapp.com/channel/0029VbCiUaNJf05WMHQji23u" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-60 group-hover:opacity-100 transition-opacity"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://t.me/+byN-nnS76SVmM2I1" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-60 group-hover:opacity-100 transition-opacity"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/inblood-com/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-60 group-hover:opacity-100 transition-opacity"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>

            {/* Navigate + Legal links below socials */}
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div>
                <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 mb-5 font-semibold">Navigate</p>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/discover" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      Discover
                    </Link>
                  </li>
                  <li>
                    <Link href="/premium" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      Premium
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      Login
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 mb-5 font-semibold">Legal</p>
                <ul className="space-y-3">
                  <LegalFooterLinks />
                  <li>
                    <Link href="/terms" className="text-white/70 text-[16px] hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-light">
                      Terms &amp; Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Col 2: Private Groups + Get the App */}
          <div data-footer-col>
            {/* Private Facebook Groups */}
            <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 mb-4 font-semibold">Private Facebook Groups</p>
            <div className="flex flex-col gap-2 mb-8">
              {[
                { href: "https://www.facebook.com/share/g/16q5Tu6uTc/", label: "Gay+", desc: "Safe space for gay & queer men", colors: ["#E40303", "#FF8C00"] },
                { href: "https://www.facebook.com/share/g/1LyzKRumkw/", label: "Lesbian+", desc: "Community for lesbian & queer women", colors: ["#732982", "#E4405F"] },
                { href: "https://www.facebook.com/share/g/19aKy5qVhW/", label: "Dating", desc: "Find your perfect match", colors: ["#FF8C00", "#E40303"] },
              ].map((group, i) => (
                <a
                  key={i}
                  href={group.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 border border-white/10 hover:border-primary/40 rounded-2xl px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${group.colors[0]}30, ${group.colors[1]}30)` }}
                  >
                    <svg className="w-5 h-5" style={{ color: group.colors[0] }} viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-[15px] font-semibold">{group.label}</span>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: `linear-gradient(135deg, ${group.colors[0]}40, ${group.colors[1]}40)`, color: group.colors[0] }}
                      >
                        Join
                      </span>
                    </div>
                    <p className="text-white/40 text-[12px] mt-0.5 truncate">{group.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </a>
              ))}
            </div>

            <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 mb-4 font-semibold">Get The App</p>
            <p className="text-white/60 text-[16px] font-light leading-relaxed mb-5">
              Download InBlood and start matching today.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <a
                href="https://play.google.com/store/apps/details?id=com.inblood.app&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-4 bg-black border border-primary/40 hover:border-primary rounded-2xl px-6 py-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <svg width="24" height="26" viewBox="0 0 18 20" fill="#dc2626" className="relative z-10 shrink-0"><path d="M0.6 0.418C0.216 0.818 0 1.418 0 2.168v15.64c0 0.75 0.216 1.35 0.6 1.75l0.09 0.09L10.44 10l-0.09-0.09L0.6 0.418z"/><path d="M13.72 13.28L10.44 10l3.28-3.28 3.7 2.13c1.06 0.6 1.06 1.58 0 2.18l-3.7 2.25z" fill="#ef4444"/><path d="M13.72 13.28L10.44 10 0.69 19.56c0.35 0.37 0.92 0.42 1.58 0.05l11.45-6.33z" fill="#ff4444"/><path d="M13.72 6.72L2.27 0.39C1.61 0.02 1.04 0.07 0.69 0.44L10.44 10l3.28-3.28z" fill="#b91c1c"/></svg>
                <div className="relative z-10 text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 leading-none">Get it on</p>
                  <p className="text-primary text-[17px] font-bold leading-tight mt-1" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Google Play</p>
                </div>
              </a>
              <a
                href="#"
                className="group relative flex items-center justify-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-6 py-5 opacity-70 cursor-default overflow-hidden"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#888" className="shrink-0"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 leading-none">Coming Soon on</p>
                  <p className="text-white/60 text-[17px] font-bold leading-tight mt-1" style={{ fontFamily: "'Archivo Black', sans-serif" }}>App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div data-footer-line className="h-px bg-white/[0.06] mb-8" />

        {/* Bottom bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <p data-footer-bottom className="text-[12px] sm:text-[13px] text-white/40 tracking-wider text-center md:text-left">
            &copy; {new Date().getFullYear()} InBlood. All rights reserved.
          </p>
          <div data-footer-bottom className="flex items-center justify-center gap-4 sm:gap-6">
            <span className="text-[12px] sm:text-[13px] text-white/40 tracking-wider">Designed with love</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[12px] sm:text-[13px] text-white/40 tracking-wider">Made for everyone</span>
          </div>
          <div className="flex justify-center md:justify-end">
            <button
              data-footer-bottom
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group"
              aria-label="Back to top"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
