"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  MessageCircle,
  Shield,
  MapPin,
  Star,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: Heart,
    title: "Swipe & Match",
    description:
      "Discover amazing people near you. Like, pass, or super like — when the feeling is mutual, it's a match!",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description:
      "Message your matches instantly with typing indicators, read receipts, and media sharing.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: MapPin,
    title: "Nearby Discovery",
    description:
      "Find people close to you with our location-based discovery. See who's active nearby.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    description:
      "Verify your profile, block unwanted contacts, and enjoy a safe dating experience.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Star,
    title: "Stories",
    description:
      "Share moments from your day. Post photos and videos that disappear in 24 hours.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Sparkles,
    title: "Premium Features",
    description:
      "Unlock unlimited swipes, see who likes you, super likes, and much more with Premium.",
    color: "from-yellow-500 to-amber-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">InBlood</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm text-text-secondary hover:text-white transition-colors hidden sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm text-text-secondary hover:text-white transition-colors hidden sm:block"
            >
              About
            </Link>
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-primary mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-primary/30">
              <Flame className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              Find Your{" "}
              <span className="gradient-text">Perfect Match</span>
            </h1>

            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              InBlood is a modern dating platform that helps you find meaningful
              connections with people who share your passions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="text-lg px-10">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-10">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 px-6">
          {[
            { value: "50K+", label: "Active Users" },
            { value: "10K+", label: "Matches Made" },
            { value: "4.8", label: "App Rating" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-black text-white mb-1">
                {stat.value}
              </p>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              From swiping to chatting to stories — InBlood has all the features
              to help you find your person.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-border-light transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-3xl p-12 border border-primary/20">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Find Your Match?
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
            Join thousands of people who are already finding meaningful
            connections on InBlood.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-10">
              Start Now — It's Free
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">InBlood</span>
          </div>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} InBlood. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
