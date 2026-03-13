"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";

const slides = [
  {
    title: "Welcome to InBlood",
    description:
      "A modern dating platform designed to help you find meaningful connections with people who share your passions.",
  },
  {
    title: "Swipe & Match",
    description:
      "Discover amazing people near you. Swipe right to like, left to pass, and up for a super like. When the feeling is mutual, it's a match!",
  },
  {
    title: "Discover Nearby",
    description:
      "Find people close to you with our location-based discovery. See who's active nearby and start meaningful conversations.",
  },
  {
    title: "Safe & Verified",
    description:
      "Your safety matters. Verify your profile, block unwanted contacts, and enjoy a safe dating experience.",
  },
  {
    title: "Ready to Start?",
    description:
      "Create your profile, add your best photos, and start meeting incredible people today.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const animateIn = () => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current.querySelectorAll("[data-slide]"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }
    );
  };

  useEffect(() => {
    animateIn();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/login");
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full max-w-md relative z-10 flex flex-col h-[min(600px,80vh)]">
      {/* Content */}
      <div ref={contentRef} className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="text-center px-2">
          <div data-slide className="mb-10">
            {currentSlide === 0 ? (
              <Image src="/logo.png" alt="InBlood" width={48} height={48} className="mx-auto rounded-xl" />
            ) : (
              <span className="text-6xl font-extralight text-white/10 font-mono">
                {String(currentSlide).padStart(2, "0")}
              </span>
            )}
          </div>

          <h1 data-slide className="text-3xl md:text-4xl font-light text-white mb-5 tracking-tight">
            {slide.title}
          </h1>
          <p data-slide className="text-white/35 text-[15px] leading-relaxed font-light max-w-sm mx-auto">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 pt-6">
        {/* Progress */}
        <div className="flex justify-center gap-3 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-px transition-all duration-300 ${
                i === currentSlide
                  ? "w-10 bg-white"
                  : "w-6 bg-white/10 hover:bg-white/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 bg-primary text-white text-sm uppercase tracking-widest hover:bg-primary-dark transition-colors"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>

        {currentSlide < slides.length - 1 ? (
          <button
            onClick={() => router.push("/login")}
            className="w-full mt-4 text-white/20 text-[12px] uppercase tracking-[0.2em] hover:text-white/50 transition-colors h-8"
          >
            Skip
          </button>
        ) : (
          <div className="h-12" />
        )}
      </div>
    </div>
  );
}
