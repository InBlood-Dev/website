"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Syncs authenticated user identity with PostHog.
 * Place this inside the PostHogProvider.
 */
export function PostHogIdentify() {
  const ph = usePostHog();
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    if (!ph) return;
    if (userId) {
      ph.identify(userId);
    } else {
      ph.reset();
    }
  }, [ph, userId]);

  return null;
}
