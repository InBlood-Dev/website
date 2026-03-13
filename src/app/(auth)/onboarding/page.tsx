"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { Flame, Heart, Shield, MapPin, Sparkles } from "lucide-react";

const slides = [
  {
    icon: Flame,
    title: "Welcome to InBlood",
    description:
      "A modern dating platform designed to help you find meaningful connections with people who share your passions.",
    color: "from-primary to-primary-dark",
  },
  {
    icon: Heart,
    title: "Swipe & Match",
    description:
      "Discover amazing people near you. Swipe right to like, left to pass, and up for a super like. When the feeling is mutual, it's a match!",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: MapPin,
    title: "Discover Nearby",
    description:
      "Find people close to you with our location-based discovery. See who's active nearby and start meaningful conversations.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    description:
      "Your safety matters. Verify your profile, block unwanted contacts, and enjoy a safe dating experience.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Sparkles,
    title: "Ready to Start?",
    description:
      "Create your profile, add your best photos, and start meeting incredible people today.",
    color: "from-amber-500 to-orange-600",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/login");
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.color} mx-auto mb-8 flex items-center justify-center shadow-2xl`}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-black text-white mb-4">
            {slide.title}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-10">
            {slide.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-card-light hover:bg-border"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {currentSlide > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setCurrentSlide(currentSlide - 1)}
          >
            Back
          </Button>
        )}
        <Button onClick={handleNext} size="lg" fullWidth>
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>

      {currentSlide < slides.length - 1 && (
        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 text-text-muted text-sm hover:text-white transition-colors"
        >
          Skip
        </button>
      )}
    </div>
  );
}
