"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Skeleton from "@/components/ui/Skeleton";
import { Crown, Heart, Star, Lock } from "lucide-react";
import type { PendingLikesResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

export default function LikesPage() {
  const router = useRouter();
  const [data, setData] = useState<PendingLikesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet<PendingLikesResponse>(
          ENDPOINTS.INTERACTIONS.PENDING_LIKES
        );
        setData(response.data);
        setIsPremium(true);
      } catch {
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (!isPremium && !isLoading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Likes" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-dark mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              See Who Likes You
            </h2>
            <p className="text-text-secondary mb-6">
              Upgrade to Premium to see everyone who has liked your profile
            </p>
            <button
              onClick={() => router.push("/premium")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={`Likes${data ? ` (${data.count})` : ""}`} />

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[3/4] rounded-2xl"
                variant="rectangular"
              />
            ))}
          </div>
        ) : data?.likes.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No likes yet
            </h2>
            <p className="text-text-secondary">
              Keep your profile active to receive more likes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data?.likes.map((like) => (
              <button
                key={like.like_id}
                onClick={() => router.push(`/profile/${like.user.user_id}`)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card group"
              >
                <Image
                  src={like.user.primary_photo}
                  alt={like.user.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                {like.is_super_like && (
                  <div className="absolute top-3 right-3">
                    <Star className="w-5 h-5 text-superlike fill-superlike" />
                  </div>
                )}

                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-semibold text-sm">
                    {like.user.name}, {like.user.age}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
