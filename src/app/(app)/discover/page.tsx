"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet, put as apiPut } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Skeleton from "@/components/ui/Skeleton";
import { MapPin, Compass, LocateFixed } from "lucide-react";
import type { RecommendedUser, DiscoveryFeedResponse, ExploreFeedResponse } from "@/lib/api/types";

interface DisplayProfile {
  user_id: string;
  name: string;
  age: number;
  distance?: number;
  primary_photo: string;
  is_online?: boolean;
  relationship_types?: Array<{ type: string; border_color: string }>;
  bio?: string;
  match_score?: number;
  seductions_count?: number;
  hearts_count?: number;
  tags?: Array<{ name: string; category?: string }>;
}

const LIMIT = 30;

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DisplayProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLocation, setNeedsLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const locationSent = useRef(false);

  const updateLocation = useCallback(async (): Promise<boolean> => {
    if (locationSent.current) return true;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });
      console.log("[Discover] Got location:", pos.coords.latitude, pos.coords.longitude);
      await apiPut(ENDPOINTS.USERS.LOCATION, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      locationSent.current = true;
      console.log("[Discover] Location updated on backend");
      return true;
    } catch (e) {
      console.log("[Discover] Location failed:", e);
      return false;
    }
  }, []);

  const loadProfiles = useCallback(async (currentOffset: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setNeedsLocation(false);

      let loaded: DisplayProfile[] = [];
      let more = false;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiGet<any>(
          ENDPOINTS.DISCOVERY.FEED,
          { limit: LIMIT, offset: currentOffset }
        );
        console.log("[Discover] /discovery/feed response:", response);

        // Backend returns data.profiles (not data.users)
        const rawProfiles = response.data?.profiles || response.data?.users || [];
        loaded = rawProfiles.map((u: Record<string, unknown>) => ({
          user_id: u.user_id,
          name: u.name,
          age: u.age,
          distance: u.distance,
          // Fallback to first photo if primary_photo is null
          primary_photo: u.primary_photo || (u.photos as string[])?.[0] || null,
          is_online: u.is_online,
          relationship_types: u.relationship_types,
          bio: u.bio,
          match_score: u.match_score,
          seductions_count: u.seductions_count,
          hearts_count: u.hearts_count,
          tags: u.tags,
        })) as DisplayProfile[];
        more = response.data?.has_more ?? loaded.length >= LIMIT;
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.log("[Discover] /discovery/feed failed:", errMsg);

        // If location error, flag it
        if (errMsg.toLowerCase().includes("location")) {
          setNeedsLocation(true);
          setIsLoading(false);
          return;
        }

        // Fallback to gallery
        try {
          const response = await apiGet<ExploreFeedResponse>(
            ENDPOINTS.DISCOVERY.GALLERY,
            { limit: LIMIT, offset: currentOffset }
          );
          console.log("[Discover] /explore/gallery response:", response);

          const galleryProfiles = response.data?.profiles || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          loaded = galleryProfiles.map((p: any) => ({
            ...p,
            primary_photo: p.primary_photo || p.photos?.[0] || null,
          }));
          more = response.data?.has_more ?? galleryProfiles.length >= LIMIT;
        } catch (e2: unknown) {
          const errMsg2 = e2 instanceof Error ? e2.message : String(e2);
          if (errMsg2.toLowerCase().includes("location")) {
            setNeedsLocation(true);
            setIsLoading(false);
            return;
          }
          throw e2;
        }
      }

      if (currentOffset === 0) {
        setProfiles(loaded);
      } else {
        setProfiles((prev) => [...prev, ...loaded]);
      }
      setHasMore(more);
    } catch (e) {
      console.error("[Discover] All endpoints failed:", e);
      setError("Failed to load profiles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEnableLocation = useCallback(async () => {
    setLocationLoading(true);
    const success = await updateLocation();
    setLocationLoading(false);
    if (success) {
      setNeedsLocation(false);
      loadProfiles(0);
    } else {
      setError("Location permission denied. Please allow location access in your browser settings and try again.");
    }
  }, [updateLocation, loadProfiles]);

  useEffect(() => {
    // Try to update location first, then load profiles
    updateLocation().then(() => loadProfiles(0));
  }, [updateLocation, loadProfiles]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextOffset = offset + LIMIT;
      setOffset(nextOffset);
      loadProfiles(nextOffset);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Discover" />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Location required state */}
        {needsLocation && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-[15px]" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <LocateFixed className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h2 className="text-lg font-medium text-white mb-2 tracking-tight">
              Enable Location
            </h2>
            <p className="text-white/30 text-sm text-center max-w-xs mb-6">
              InBlood needs your location to show people near you
            </p>
            <button
              onClick={handleEnableLocation}
              disabled={locationLoading}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-full shadow-lg shadow-primary/25 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {locationLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Getting location...
                </span>
              ) : (
                "Allow Location Access"
              )}
            </button>
          </div>
        )}

        {/* Error state */}
        {error && !needsLocation && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Compass className="w-10 h-10 text-white/10 mb-5" />
            <p className="text-white/30 text-sm text-center mb-4 max-w-xs">{error}</p>
            <button
              onClick={() => { setOffset(0); setError(null); updateLocation().then(() => loadProfiles(0)); }}
              className="px-6 py-2.5 bg-primary/20 border border-primary/30 rounded-full text-white text-sm hover:bg-primary/30 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && !needsLocation && !isLoading && profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Compass className="w-10 h-10 text-white/10 mb-5" />
            <h2 className="text-lg font-medium text-white mb-2 tracking-tight">
              No one nearby
            </h2>
            <p className="text-white/30 text-sm text-center max-w-xs">
              Try expanding your distance preferences to discover more people
            </p>
          </div>
        ) : !needsLocation && !error ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {profiles.map((profile) => (
              <button
                key={profile.user_id}
                onClick={() => router.push(`/profile/${profile.user_id}`)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
              >
                {profile.primary_photo ? (
                  <Image
                    src={profile.primary_photo}
                    alt={profile.name}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                    <span className="text-3xl text-white/20">{profile.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {profile.is_online && (
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-black/30" />
                )}

                {profile.relationship_types?.[0] && (
                  <div
                    className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                    style={{
                      borderColor: profile.relationship_types[0].border_color,
                    }}
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <p className="text-white font-medium text-[13px]">
                    {profile.name}, {profile.age}
                  </p>
                  {profile.distance !== undefined && (
                    <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
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
        ) : null}

        {hasMore && !isLoading && profiles.length > 0 && (
          <div className="flex justify-center py-10">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-white/[0.04] border border-white/[0.08] rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-sm tracking-wide"
            >
              Load more
            </button>
          </div>
        )}

        {!hasMore && profiles.length > 0 && (
          <p className="text-center text-white/15 text-sm py-10 tracking-wide">
            You&apos;ve seen everyone nearby
          </p>
        )}
      </div>
    </div>
  );
}
