"use client";

import { useEffect, useState } from "react";
import { get as apiGet, post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
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
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-full bg-superlike/10 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-7 h-7 text-superlike" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2 tracking-tight">
              You&apos;re Premium!
            </h2>
            <p className="text-white/30 text-sm leading-relaxed">
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
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-superlike/10 flex items-center justify-center mx-auto mb-5">
            <Crown className="w-7 h-7 text-superlike" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-2 tracking-tight">
            Upgrade to Premium
          </h1>
          <p className="text-white/30 text-sm">
            Get more matches and exclusive features
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-3 max-w-md mx-auto mb-10">
          {plans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => setSelectedPlan(plan._id)}
              className={cn(
                "relative p-5 border rounded-xl text-left transition-all",
                selectedPlan === plan._id
                  ? "border-primary bg-primary/5"
                  : "border-white/[0.06] hover:border-white/[0.15] bg-white/[0.02]"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 right-4 px-3 py-0.5 text-[10px] uppercase tracking-wider font-medium text-white bg-primary rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-sm font-medium text-white">{plan.name}</h3>
                <div className="text-right">
                  <span className="text-2xl font-medium text-white tracking-tight">
                    {plan.currency === "INR" ? "₹" : "$"}{plan.price}
                  </span>
                  <span className="text-white/25 text-sm ml-1">
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
        {plans.length > 0 && selectedPlan && (
          <div className="max-w-md mx-auto mb-10">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-5">
              What&apos;s Included
            </h3>
            <div className="space-y-3.5">
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
                        "text-sm",
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

        <div className="max-w-md mx-auto">
          <button
            onClick={handlePurchase}
            disabled={!selectedPlan || isPurchasing}
            className="w-full py-4 bg-primary text-white text-sm uppercase tracking-[0.15em] hover:bg-primary-dark transition-colors disabled:opacity-50 rounded-full"
          >
            {isPurchasing ? "Processing..." : "Upgrade Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
