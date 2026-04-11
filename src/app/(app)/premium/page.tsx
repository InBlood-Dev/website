"use client";

import { useEffect, useState } from "react";
import { get as apiGet, post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import { useUIStore } from "@/stores/ui.store";
import { posthog } from "@/lib/analytics/posthog";
import { cn } from "@/lib/utils/cn";
import type { SubscriptionPlan, SubscriptionStatusResponse } from "@/lib/api/types";
import {
  Crown,
  Check,
  X,
  Heart,
  Star,
  Eye,
  Zap,
  Shield,
  Infinity,
} from "lucide-react";

const featureIcons: Record<string, React.ReactNode> = {
  hearts: <Heart className="w-4 h-4" />,
  "super likes": <Star className="w-4 h-4" />,
  likes: <Eye className="w-4 h-4" />,
  unlimited: <Infinity className="w-4 h-4" />,
  boost: <Zap className="w-4 h-4" />,
  default: <Shield className="w-4 h-4" />,
};

export default function PremiumPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    posthog?.capture("premium_page_viewed");
  }, []);

  useEffect(() => {
    (async () => {
      // Fetch plans and subscription separately so one failure doesn't block the other
      let loadedPlans: SubscriptionPlan[] = [];

      try {
        const plansRes = await apiGet<{ plans: SubscriptionPlan[] }>(ENDPOINTS.PAYMENTS.PLANS);
        loadedPlans = plansRes.data?.plans || [];
      } catch {
        console.log("[Premium] Failed to fetch plans from API, using fallback");
      }

      // If API returned no plans, use fallback
      if (loadedPlans.length === 0) {
        loadedPlans = [
          {
            _id: "monthly",
            plan_key: "monthly",
            name: "Monthly",
            price: 499,
            original_price: null,
            currency: "INR",
            duration_days: 30,
            period_label: "month",
            badge: null,
            badge_color: null,
            discount_label: null,
            features: [
              { text: "Unlimited Swipes", included: true },
              { text: "See Who Likes You", included: true },
              { text: "5 Super Likes per day", included: true },
              { text: "1 Boost per month", included: true },
              { text: "Rewind last swipe", included: true },
            ],
            is_active: true,
            sort_order: 1,
          },
          {
            _id: "annual",
            plan_key: "annual",
            name: "Annual",
            price: 2999,
            original_price: 5988,
            currency: "INR",
            duration_days: 365,
            period_label: "year",
            badge: "Best Value",
            badge_color: "#E53935",
            discount_label: "Save 50%",
            features: [
              { text: "Unlimited Swipes", included: true },
              { text: "See Who Likes You", included: true },
              { text: "Unlimited Super Likes", included: true },
              { text: "3 Boosts per month", included: true },
              { text: "Rewind last swipe", included: true },
              { text: "Priority in Discovery", included: true },
            ],
            is_active: true,
            sort_order: 2,
          },
        ];
      }

      setPlans(loadedPlans);
      setSelectedPlan(loadedPlans[0]._id);

      try {
        const subRes = await apiGet<SubscriptionStatusResponse>(ENDPOINTS.SUBSCRIPTIONS.STATUS);
        setSubscription(subRes.data);
      } catch {
        // Not premium or API failed — that's fine
      }

      setIsLoading(false);
    })();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    const plan = plans.find((p) => p._id === selectedPlan);
    if (!plan) return;

    setIsPurchasing(true);
    posthog?.capture("premium_checkout_started", { plan: plan.plan_key, amount: plan.price });
    try {
      const response = await post<{
        payment_session_id: string;
        order_id: string;
      }>(ENDPOINTS.PAYMENTS.CREATE_ORDER, {
        plan_key: plan.plan_key,
      });

      // NOTE: this only confirms order creation, not actual payment success.
      // The real `premium_purchase_success` should be fired from a backend
      // payment-confirmation webhook once the website integrates Cashfree.
      posthog?.capture("premium_order_created", { plan: plan.plan_key, amount: plan.price });
      addToast({
        message: "Order created. Payment integration pending.",
        type: "info",
      });
    } catch {
      addToast({ message: "Failed to create order", type: "error" });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (subscription?.is_premium) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Premium" />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-superlike/10 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-7 h-7 text-superlike" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2 tracking-tight">
            You&apos;re Premium!
          </h2>
          <p className="text-white/30 text-sm leading-relaxed text-center max-w-xs">
            Your {subscription.subscription?.plan_type} subscription is active
            until{" "}
            {subscription.subscription?.expires_at
              ? new Date(subscription.subscription.expires_at).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Premium" />

      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-superlike/10 flex items-center justify-center mx-auto mb-5 animate-pulse">
              <Crown className="w-7 h-7 text-superlike" />
            </div>
            <p className="text-white/30 text-sm">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-superlike/10 flex items-center justify-center mx-auto mb-5">
              <Crown className="w-7 h-7 text-superlike" />
            </div>
            <h1 className="text-2xl font-medium text-white mb-2 tracking-tight">
              Premium
            </h1>
            <p className="text-white/30 text-sm mb-8">
              Premium plans coming soon
            </p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-superlike/10 flex items-center justify-center mx-auto mb-5">
                <Crown className="w-7 h-7 md:w-9 md:h-9 text-superlike" />
              </div>
              <h1 className="text-2xl md:text-3xl font-medium text-white mb-2 tracking-tight">
                Upgrade to Premium
              </h1>
              <p className="text-white/30 text-sm md:text-base">
                Get more matches and exclusive features
              </p>
            </div>

            {/* Plans */}
            <div className="grid gap-4 max-w-md md:max-w-2xl mx-auto mb-10 md:grid-cols-2">
              {plans.map((plan) => (
                <button
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan._id)}
                  className={cn(
                    "relative p-5 md:p-7 border rounded-2xl text-left transition-all",
                    selectedPlan === plan._id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-white/[0.06] hover:border-white/[0.15] bg-white/[0.02]"
                  )}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 right-4 px-3 py-0.5 text-[10px] md:text-[11px] uppercase tracking-wider font-medium text-white bg-primary rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-sm md:text-base font-medium text-white">{plan.name}</h3>
                    <div className="text-right">
                      <span className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                        {plan.currency === "INR" ? "₹" : "$"}{plan.price}
                      </span>
                      <span className="text-white/25 text-sm md:text-base ml-1">
                        /{plan.period_label}
                      </span>
                    </div>
                  </div>
                  {plan.original_price && (
                    <p className="text-white/20 text-xs line-through">
                      {plan.currency === "INR" ? "₹" : "$"}{plan.original_price}
                      {plan.discount_label && (
                        <span className="text-primary ml-2 no-underline">
                          {plan.discount_label}
                        </span>
                      )}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Features */}
            {selectedPlan && (
              <div className="max-w-md md:max-w-2xl mx-auto mb-10">
                <h3 className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-white/25 mb-5">
                  What&apos;s Included
                </h3>
                <div className="space-y-3.5 md:space-y-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-4 md:space-y-0">
                  {plans
                    .find((p) => p._id === selectedPlan)
                    ?.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-success" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0">
                            <X className="w-3.5 h-3.5 text-white/20" />
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-sm md:text-base",
                            feature.included ? "text-white" : "text-white/25"
                          )}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </>
        )}
      </div>

      {/* Sticky upgrade button */}
      {!isLoading && plans.length > 0 && !subscription?.is_premium && (
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="flex justify-center">
            <button
              onClick={handlePurchase}
              disabled={!selectedPlan || isPurchasing}
              className="px-12 py-3.5 md:px-16 md:py-4 bg-gradient-to-r from-primary to-primary-light text-white text-sm md:text-base uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50 rounded-full shadow-lg shadow-primary/25"
            >
              {isPurchasing ? "Processing..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
