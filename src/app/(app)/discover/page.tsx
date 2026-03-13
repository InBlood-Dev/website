"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { MapPin, BadgeCheck, Grid, List } from "lucide-react";
import type { ExploreFeedResponse } from "@/lib/api/types";

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ExploreFeedResponse["profiles"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadProfiles = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await apiGet<ExploreFeedResponse>(
        ENDPOINTS.DISCOVERY.GALLERY,
        { page: pageNum, limit: 20 }
      );
      if (pageNum === 1) {
        setProfiles(response.data.profiles);
      } else {
        setProfiles((prev) => [...prev, ...response.data.profiles]);
      }
      setHasMore(response.data.has_more);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles(1);
  }, [loadProfiles]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProfiles(nextPage);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Discover" />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {profiles.map((profile) => (
            <button
              key={profile.user_id}
              onClick={() => router.push(`/profile/${profile.user_id}`)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-card"
            >
              <Image
                src={profile.primary_photo}
                alt={profile.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Online indicator */}
              {profile.is_online && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-success border-2 border-black/30" />
              )}

              {/* Relationship type borders */}
              {profile.relationship_types?.[0] && (
                <div
                  className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                  style={{
                    borderColor: profile.relationship_types[0].border_color,
                  }}
                />
              )}

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm">
                  {profile.name}, {profile.age}
                </p>
                {profile.distance !== undefined && (
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {Math.round(profile.distance)} km
                  </p>
                )}
              </div>
            </button>
          ))}

          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={`skeleton-${i}`}
                className="aspect-[3/4] rounded-2xl"
                variant="rectangular"
              />
            ))}
        </div>

        {hasMore && !isLoading && (
          <div className="flex justify-center py-6">
            <button
              onClick={loadMore}
              className="text-primary hover:text-primary-light font-medium text-sm"
            >
              Load more
            </button>
          </div>
        )}

        {!hasMore && profiles.length > 0 && (
          <p className="text-center text-text-muted text-sm py-6">
            You've seen everyone nearby
          </p>
        )}
      </div>
    </div>
  );
}
