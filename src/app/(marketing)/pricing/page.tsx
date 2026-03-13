"use client";

import Link from "next/link";
import { Flame, Check, X, Crown } from "lucide-react";
import Button from "@/components/ui/Button";

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
    variant: "secondary" as const,
  },
  {
    name: "Premium",
    price: "₹499",
    period: "month",
    badge: "Popular",
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
    variant: "primary" as const,
  },
  {
    name: "Premium Plus",
    price: "₹2999",
    period: "year",
    badge: "Best Value",
    badgeColor: "#4CAF50",
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
    variant: "primary" as const,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
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

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <Crown className="w-12 h-12 text-superlike mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Upgrade to unlock premium features and supercharge your dating experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card rounded-2xl p-6 border ${
                plan.badge === "Popular"
                  ? "border-primary ring-1 ring-primary"
                  : "border-border"
              }`}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: plan.badgeColor || "#E53935",
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-text-muted">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-text-muted shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-white" : "text-text-muted"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/login">
                <Button
                  variant={plan.variant}
                  fullWidth
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
