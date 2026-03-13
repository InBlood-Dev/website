"use client";

import Link from "next/link";
import { Flame, Heart, Users, Globe } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">InBlood</span>
          </Link>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-6">About InBlood</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p className="text-lg leading-relaxed">
            InBlood is a modern dating platform built for people who value
            genuine connections. We believe everyone deserves to find someone
            special, and we've designed our platform to make that journey
            exciting, safe, and fun.
          </p>

          <div className="grid md:grid-cols-3 gap-6 py-8">
            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Our Mission</h3>
              <p className="text-sm">
                Help people find meaningful connections that enrich their lives.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <Users className="w-10 h-10 text-info mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Community First</h3>
              <p className="text-sm">
                A safe, inclusive space where everyone can be their authentic self.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <Globe className="w-10 h-10 text-success mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Growing Daily</h3>
              <p className="text-sm">
                Connecting people across cities with local discovery features.
              </p>
            </div>
          </div>

          <p>
            We use smart matching algorithms to help you discover compatible
            people nearby. Our swipe-based interface makes it easy and fun to
            explore potential matches, while our real-time chat lets you connect
            instantly.
          </p>

          <p>
            Safety is our top priority. We offer profile verification, blocking
            tools, and a dedicated reporting system to ensure InBlood remains a
            respectful space for everyone.
          </p>
        </div>
      </main>
    </div>
  );
}
