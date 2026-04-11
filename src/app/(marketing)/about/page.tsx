"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/layout/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const editorialRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbitLeftRef = useRef<HTMLDivElement>(null);
  const orbitRightRef = useRef<HTMLDivElement>(null);
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
      // Hero images
      gsap.from("[data-hero-img]", {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        delay: 0.4,
        ease: "power3.out",
        stagger: 0.15,
      });

      // Editorial blocks
      document.querySelectorAll("[data-editorial]").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          y: 80,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
        });
      });

      // Editorial images parallax
      document.querySelectorAll("[data-editorial-img]").forEach((img) => {
        gsap.to(img, {
          scrollTrigger: {
            trigger: img.closest("[data-editorial]") || img,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
          y: -30,
          ease: "none",
        });
      });

      // Manifesto text
      gsap.from("[data-manifesto]", {
        scrollTrigger: { trigger: manifestoRef.current, start: "top 80%" },
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power4.out",
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
            <Link href="/" className="text-[12px] text-white/50 hover:text-white transition-colors hidden sm:block uppercase tracking-[0.15em]">
              Home
            </Link>
            <Link href="/pricing" className="text-[12px] text-white/50 hover:text-white transition-colors hidden sm:block uppercase tracking-[0.15em]">
              Pricing
            </Link>
            <Link href="/" className="text-[12px] text-black bg-white rounded-full px-5 py-2.5 uppercase tracking-[0.15em] font-medium hover:bg-white/90 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - About Us */}
      <section ref={heroRef} className="relative pt-32 pb-10 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <span data-editorial className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-medium mb-4 block">Who We Are</span>
            <h1 data-editorial className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-[0.95] tracking-[-0.03em] mb-5">
              About <span className="text-primary">Us</span>
            </h1>
            <p data-editorial className="text-[15px] md:text-[17px] text-white/40 leading-relaxed font-light max-w-lg">
              We&apos;re building the dating platform we always wished existed — one that values depth over swipes and people over profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Grid 1 - Hero Spread */}
      <section ref={editorialRef} className="px-8 md:px-16 pb-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {/* Left: Close-up face image */}
            <div data-hero-img className="col-span-4 md:col-span-3 relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <Image
                  src="/images/about-closeup1.jpg"
                  alt="Editorial close-up"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 33vw, 22vw"
                />
              </div>
            </div>

            {/* Center: Fashion/editorial image */}
            <div data-hero-img className="col-span-8 md:col-span-5 relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <Image
                  src="/images/about-couple1.jpg"
                  alt="Couple walking together"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 66vw, 38vw"
                />
              </div>
            </div>

            {/* Right: Headline text block */}
            <div className="col-span-12 md:col-span-4 flex flex-col justify-center md:pl-4">
              <div data-editorial>
                <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-black text-white leading-[1] tracking-[-0.02em] mb-4">
                  There was no rhyme or reason to InBlood&apos;s origin story
                </h2>
                <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed font-light mb-6">
                  Born from a desire to create something real in a world of shallow connections, InBlood encourages people to break free from what&apos;s expected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="h-px bg-white/[0.08]" />
      </div>

      {/* Editorial Grid 2 - Story Block */}
      <section ref={storyRef} className="px-8 md:px-16 py-10 md:py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-3 md:gap-4 items-start">
            {/* Left: headline text */}
            <div className="col-span-12 md:col-span-3 mb-6 md:mb-0" data-editorial>
              <h2 className="text-[clamp(1.8rem,3.5vw,3rem)] font-black text-white leading-[1.05] tracking-[-0.02em]">
                Our mission<br />
                to redefine<br />
                modern<br />
                <span className="text-primary">connection:</span>
              </h2>
            </div>

            {/* Center: 3 images collage */}
            <div className="col-span-12 md:col-span-6 grid grid-cols-3 gap-2 md:gap-3">
              <div data-editorial className="relative aspect-[3/4] overflow-hidden col-span-1">
                <Image
                  src="/images/about-couple2.jpg"
                  alt="Couple enjoying time together"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              </div>
              <div data-editorial className="relative aspect-[3/4] overflow-hidden col-span-1">
                <Image
                  src="/images/about-couple3.jpg"
                  alt="Couple on a date"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              </div>
              <div data-editorial className="relative aspect-[3/4] overflow-hidden col-span-1">
                <Image
                  src="/images/about-couple4.jpg"
                  alt="Couple in love"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              </div>
            </div>

            {/* Right: close-up */}
            <div data-editorial className="col-span-12 md:col-span-3 relative">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/about-couple5.jpg"
                  alt="Romantic moment"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            </div>

            {/* Bottom text block */}
            <div className="col-span-12 md:col-start-1 md:col-span-5 mt-4" data-editorial>
              <p className="text-[clamp(1rem,1.8vw,1.3rem)] font-black text-white leading-[1.3] tracking-[-0.01em]">
                People won&apos;t be expecting this.
              </p>
              <p className="text-[12px] md:text-[13px] text-white/35 leading-relaxed font-light mt-3 max-w-md">
                With a reinvented vision for authentic connection, we sat down with our team to talk about their evolving approach to matchmaking, designing experiences that matter, and an unexpected community.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="h-px bg-white/[0.08]" />
      </div>

      {/* Manifesto Section */}
      <section ref={manifestoRef} className="px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-4 md:gap-8 items-start">
            {/* Left: large editorial image */}
            <div data-manifesto className="col-span-12 md:col-span-5 relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm" data-editorial-img>
                <Image
                  src="/images/about-couple6.jpg"
                  alt="Couple connection"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right: manifesto text */}
            <div className="col-span-12 md:col-span-7 flex flex-col justify-center md:pl-8">
              <span data-manifesto className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium mb-8 block">Our Manifesto</span>

              <h2 data-manifesto className="text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-[0.92] tracking-[-0.04em] uppercase mb-8">
                We believe in<br />
                <span className="text-primary">raw,</span> real<br />
                connections.
              </h2>

              <p data-manifesto className="text-[14px] md:text-[16px] text-white/40 leading-relaxed font-light max-w-lg mb-8">
                InBlood was built for people who are tired of the superficial. We don&apos;t do algorithms that reduce humans to data points. We create spaces where authenticity thrives — where being yourself isn&apos;t just encouraged, it&apos;s the whole point.
              </p>

              <p data-manifesto className="text-[14px] md:text-[16px] text-white/40 leading-relaxed font-light max-w-lg mb-10">
                Our community is diverse, bold, and unapologetically real. From the way profiles are designed to how conversations begin — every detail is crafted to foster genuine human connection.
              </p>

              <div data-manifesto className="flex items-center gap-6">
                <Link href="/" className="text-[12px] uppercase tracking-[0.2em] text-white font-bold border-b-2 border-white pb-1 hover:text-primary hover:border-primary transition-colors">
                  Join the movement
                </Link>
                <span className="text-white/15">|</span>
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/20">Est. 2024</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Values Grid - Magazine editorial cards */}
      <section className="px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 mb-12" data-editorial>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">What We Stand For</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {/* Card 1 - Large */}
            <div data-editorial className="col-span-12 md:col-span-7 relative group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                <Image
                  src="/images/about-couple7.jpg"
                  alt="Authenticity"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-black text-white leading-[1] tracking-[-0.02em] mb-2">
                    Authenticity First
                  </h3>
                  <p className="text-white/60 text-[12px] md:text-[13px] font-light max-w-sm">
                    No filters, no facades. We celebrate the real you.
                  </p>
                </div>
                <span className="absolute top-4 right-6 text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">01</span>
              </div>
            </div>

            {/* Card 2 */}
            <div data-editorial className="col-span-6 md:col-span-5 relative group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src="/images/about-couple8.jpg"
                  alt="Safety"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 35vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-[clamp(1.2rem,2.5vw,2rem)] font-black text-white leading-[1] tracking-[-0.02em] mb-2">
                    Safety Always
                  </h3>
                  <p className="text-white/60 text-[11px] md:text-[12px] font-light">
                    Your security is non-negotiable.
                  </p>
                </div>
                <span className="absolute top-4 right-6 text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">02</span>
              </div>
            </div>

            {/* Card 3 */}
            <div data-editorial className="col-span-6 md:col-span-5 relative group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src="/images/about-portrait1.jpg"
                  alt="Inclusivity"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 35vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-[clamp(1.2rem,2.5vw,2rem)] font-black text-white leading-[1] tracking-[-0.02em] mb-2">
                    Radically Inclusive
                  </h3>
                  <p className="text-white/60 text-[11px] md:text-[12px] font-light">
                    Everyone deserves love. Period.
                  </p>
                </div>
                <span className="absolute top-4 right-6 text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">03</span>
              </div>
            </div>

            {/* Card 4 - Large */}
            <div data-editorial className="col-span-12 md:col-span-7 relative group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                <Image
                  src="/images/about-couple1.jpg"
                  alt="Community"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-black text-white leading-[1] tracking-[-0.02em] mb-2">
                    Community Driven
                  </h3>
                  <p className="text-white/60 text-[12px] md:text-[13px] font-light max-w-sm">
                    Built by the community, for the community.
                  </p>
                </div>
                <span className="absolute top-4 right-6 text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">04</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section with orbiting images - same as home */}
      <section ref={ctaRef} className="relative py-40 md:py-52 border-t border-white/[0.08] overflow-hidden">
        {/* Left orbit */}
        <div className="absolute left-[-350px] md:left-[-280px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none">
          <div ref={orbitLeftRef} data-orbit-left className="relative w-full h-full">
            {[
              { src: "/images/about-couple1.jpg", size: "w-24 h-24 md:w-32 md:h-32", pos: "top-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/about-couple2.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[15%] right-[5%]", blur: true },
              { src: "/images/about-couple3.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "top-[45%] right-0", blur: false },
              { src: "/images/about-couple4.jpg", size: "w-24 h-24 md:w-30 md:h-30", pos: "bottom-[15%] right-[10%]", blur: true },
              { src: "/images/about-couple5.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "bottom-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/about-couple6.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "bottom-[20%] left-[5%]", blur: true },
              { src: "/images/about-couple7.jpg", size: "w-22 h-22 md:w-30 md:h-30", pos: "top-[40%] left-0", blur: false },
              { src: "/images/about-couple8.jpg", size: "w-16 h-16 md:w-20 md:h-20", pos: "top-[18%] left-[8%]", blur: true },
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
              { src: "/images/about-couple8.jpg", size: "w-24 h-24 md:w-32 md:h-32", pos: "top-0 left-1/2 -translate-x-1/2", blur: true },
              { src: "/images/about-couple7.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[12%] left-[5%]", blur: false },
              { src: "/images/about-couple6.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "top-[42%] left-0", blur: true },
              { src: "/images/about-couple5.jpg", size: "w-22 h-22 md:w-30 md:h-30", pos: "bottom-[18%] left-[8%]", blur: false },
              { src: "/images/about-couple4.jpg", size: "w-24 h-24 md:w-30 md:h-30", pos: "bottom-0 left-1/2 -translate-x-1/2", blur: false },
              { src: "/images/about-couple3.jpg", size: "w-18 h-18 md:w-24 md:h-24", pos: "bottom-[15%] right-[5%]", blur: true },
              { src: "/images/about-couple2.jpg", size: "w-20 h-20 md:w-28 md:h-28", pos: "top-[45%] right-0", blur: false },
              { src: "/images/about-couple1.jpg", size: "w-16 h-16 md:w-20 md:h-20", pos: "top-[15%] right-[8%]", blur: true },
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
            <Link href="/" className="rounded-full px-10 py-4 bg-primary text-white text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-primary-dark transition-colors">
              Start Now &mdash; It&apos;s Free
            </Link>
            <Link href="/" className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
