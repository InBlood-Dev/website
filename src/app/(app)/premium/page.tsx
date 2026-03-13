"use client";

import { useEffect, useState } from "react";
import { get as apiGet, post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useUIStore } from "@/stores/ui.store";
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
    (async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          apiGet<{ plans: SubscriptionPlan[] }>(ENDPOINTS.PAYMENTS.PLANS),
          apiGet<SubscriptionStatusResponse>(ENDPOINTS.SUBSCRIPTIONS.STATUS),
        ]);
        setPlans(plansRes.data.plans || []);
        setSubscription(subRes.data);
        if (plansRes.data.plans?.length > 0) {
          setSelectedPlan(plansRes.data.plans[0]._id);
        }
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    const plan = plans.find((p) => p._id === selectedPlan);
    if (!plan) return;

    setIsPurchasing(true);
    try {
      const response = await post<{
        payment_session_id: string;
        order_id: string;
      }>(ENDPOINTS.PAYMENTS.CREATE_ORDER, {
        plan_key: plan.plan_key,
      });

      // In production, integrate Cashfree JS SDK here
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Crown className="w-16 h-16 text-superlike mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              You're Premium!
            </h2>
            <p className="text-text-secondary mb-4">
              Your {subscription.subscription?.plan_type} subscription is active
              until{" "}
              {subscription.subscription?.expires_at
                ? new Date(subscription.subscription.expires_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Premium" />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-superlike to-amber-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-text-secondary text-lg">
            Get more matches and exclusive features
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-4 max-w-md mx-auto mb-8">
          {plans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => setSelectedPlan(plan._id)}
              className={cn(
                "relative p-5 rounded-2xl border-2 text-left transition-all",
                selectedPlan === plan._id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border-light"
              )}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: plan.badge_color || "#E53935" }}
                >
                  {plan.badge}
                </span>
              )}
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">
                    {plan.currency === "INR" ? "₹" : "$"}{plan.price}
                  </span>
                  <span className="text-text-muted text-sm">
                    /{plan.period_label}
                  </span>
                </div>
              </div>
              {plan.original_price && (
                <p className="text-text-muted text-sm line-through">
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
        {plans.length > 0 && selectedPlan && (
          <div className="max-w-md mx-auto mb-8">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">
              What's Included
            </h3>
            <div className="space-y-3">
              {plans
                .find((p) => p._id === selectedPlan)
                ?.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-text-muted shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        feature.included ? "text-white" : "text-text-muted"
                      )}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto">
          <Button
            onClick={handlePurchase}
            size="lg"
            fullWidth
            isLoading={isPurchasing}
            disabled={!selectedPlan}
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
