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
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-6">
            <Lock className="w-7 h-7 text-white/15" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2 tracking-tight">
            See Who Likes You
          </h2>
          <p className="text-white/30 mb-8 text-sm leading-relaxed text-center max-w-xs">
            Upgrade to Premium to see everyone who has liked your profile
          </p>
          <button
            onClick={() => router.push("/premium")}
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-full shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={`Likes${data ? ` (${data.count})` : ""}`} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[3/4] rounded-2xl"
                variant="rectangular"
              />
            ))}
          </div>
        ) : data?.likes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-5">
              <Heart className="w-6 h-6 text-white/20" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2 tracking-tight">
              No likes yet
            </h2>
            <p className="text-white/30 text-sm text-center max-w-xs leading-relaxed">
              Keep your profile active to receive more likes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {data?.likes.map((like) => (
              <button
                key={like.like_id}
                onClick={() => router.push(`/profile/${like.user.user_id}`)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.04] group border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
              >
                {like.user.primary_photo ? (
                  <Image
                    src={like.user.primary_photo}
                    alt={like.user.name}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                    <span className="text-3xl text-white/20">{like.user.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {like.is_super_like && (
                  <div className="absolute top-3 right-3">
                    <Star className="w-5 h-5 text-superlike fill-superlike drop-shadow-lg" />
                  </div>
                )}

                <div className="absolute bottom-3 left-3.5">
                  <p className="text-white font-medium text-[13px]">
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
