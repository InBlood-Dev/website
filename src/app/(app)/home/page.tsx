"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet, put as apiPut } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import type { SearchUser, SearchResponse, ProfileResponse } from "@/lib/api/types";
import NearbyMap from "@/components/ui/NearbyMapDynamic";
import {
  Plus,
  MapPin,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  Minus,
} from "lucide-react";

interface StoryUser {
  user_id: string;
  name: string;
  primary_photo: string | null;
  has_unviewed?: boolean;
}

interface NearbyUser {
  user_id: string;
  name: string;
  age: number;
  primary_photo: string | null;
  distance?: number;
  is_online?: boolean;
  last_active_at?: string;
  latitude?: number;
  longitude?: number;
}

interface DateProfile {
  user_id: string;
  name: string;
  age: number;
  primary_photo: string | null;
  distance?: number;
  bio?: string;
  match_score?: number;
  sexual_orientation?: string;
  is_online?: boolean;
  last_active_at?: string;
}

function isUserOnline(lastActive?: string): boolean {
  if (!lastActive) return false;
  const diff = Date.now() - new Date(lastActive).getTime();
  return diff < 5 * 60 * 1000; // 5 minutes
}

export default function HomePage() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryUser[]>([]);
  const [dates, setDates] = useState<DateProfile[]>([]);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [mapUsers, setMapUsers] = useState<NearbyUser[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Search
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filters
  const [ageRange, setAgeRange] = useState({ min: 18, max: 35 });
  const [distance, setDistance] = useState(25);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  // Helper to fetch discovery feed (used on initial load and after filter apply)
  const fetchDiscoveryFeed = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const datesRes = await apiGet<any>(ENDPOINTS.DISCOVERY.FEED, { limit: 30 });
      const profiles = datesRes.data?.profiles || datesRes.data?.users || [];
      setDates(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profiles.map((p: any) => ({
          user_id: p.user_id,
          name: p.name,
          age: p.age,
          primary_photo: p.primary_photo || p.photos?.[0] || null,
          distance: p.distance,
          bio: p.bio,
          match_score: p.match_score,
          sexual_orientation: p.sexual_orientation,
          is_online: p.is_online,
          last_active_at: p.last_active_at,
        }))
      );
    } catch {
      // Dates not available
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      // Try updating location first
      let userLat: number | undefined;
      let userLng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false,
          });
        });
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        await apiPut(ENDPOINTS.USERS.LOCATION, {
          latitude: userLat,
          longitude: userLng,
        });
      } catch {
        // Location not available
      }

      // Fetch user profile to sync filter preferences
      try {
        const profileRes = await apiGet<ProfileResponse>(ENDPOINTS.USERS.PROFILE);
        const user = profileRes.data?.user;
        if (user) {
          const ageMin = user.preference_age_min ?? user.age_min;
          const ageMax = user.preference_age_max ?? user.age_max;
          const maxDist = user.preference_max_distance ?? user.proximity_range;
          if (ageMin != null && ageMax != null) {
            setAgeRange({ min: ageMin, max: ageMax });
          }
          if (maxDist != null) {
            setDistance(maxDist);
          }
        }
      } catch {
        // Profile not available, use defaults
      }

      // Fetch stories
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const storiesRes = await apiGet<any>(ENDPOINTS.STORIES.FEED);
        const storyUsers = storiesRes.data?.stories || storiesRes.data || [];
        setStories(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          storyUsers.map((s: any) => ({
            user_id: s.user_id || s.user?.user_id,
            name: s.name || s.user?.name || s.user_name || "User",
            primary_photo: s.primary_photo || s.user?.primary_photo || s.user_photo || null,
            has_unviewed: s.has_unviewed ?? true,
          }))
        );
      } catch {
        // Stories not available
      }

      // Fetch date recommendations (same as app: GET /discovery/feed?limit=30)
      await fetchDiscoveryFeed();

      // Fetch nearby active users (same as app: GET /home/nearby-active?limit=10)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nearbyRes = await apiGet<any>(ENDPOINTS.LOCATION.NEARBY_ACTIVE, { limit: 10 });
        const nearbyUsers = nearbyRes.data?.users || nearbyRes.data?.profiles || nearbyRes.data || [];
        const mapped = nearbyUsers.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (u: any) => ({
            user_id: u.user_id,
            name: u.name,
            age: u.age,
            primary_photo: u.primary_photo || u.photos?.[0] || null,
            distance: u.distance,
            is_online: u.is_online,
            last_active_at: u.last_active_at,
            latitude: u.latitude ?? u.location?.coordinates?.[1],
            longitude: u.longitude ?? u.location?.coordinates?.[0],
          })
        );
        setNearby(mapped);
      } catch {
        // Nearby not available
      }

      // Fetch map users (same as app: GET /map/nearby?latitude=x&longitude=y&radius=25)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapParams: any = { radius: 25 };
        if (userLat != null && userLng != null) {
          mapParams.latitude = userLat;
          mapParams.longitude = userLng;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapRes = await apiGet<any>(ENDPOINTS.LOCATION.MAP_NEARBY, mapParams);
        const mapData = mapRes.data?.users || mapRes.data?.profiles || mapRes.data || [];
        setMapUsers(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mapData.slice(0, 50).map((u: any) => ({
            user_id: u.user_id,
            name: u.name,
            age: u.age,
            primary_photo: u.primary_photo || u.photos?.[0] || null,
            distance: u.distance,
            is_online: u.is_online,
            last_active_at: u.last_active_at,
            latitude: u.latitude ?? u.location?.coordinates?.[1],
            longitude: u.longitude ?? u.location?.coordinates?.[0],
          }))
        );
      } catch {
        // Map not available - use nearby users for map
      }

      setIsLoading(false);
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await apiGet<SearchResponse>(ENDPOINTS.SEARCH, {
          q: searchQuery.trim(),
          limit: 20,
        });
        setSearchResults(response.data?.users || response.data?.profiles || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const filteredStories = searchQuery
    ? stories.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stories;

  const filteredDates = useMemo(() => {
    if (searchQuery) {
      return dates.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.sexual_orientation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return dates;
  }, [dates, searchQuery]);

  // Users for the map preview (use mapUsers if available, fall back to nearby)
  const mapDisplayUsers = mapUsers.length > 0 ? mapUsers : nearby;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => setShowFilters(true)}
          className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-all"
        >
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </button>

        <h1 className="text-base font-medium text-white">Home</h1>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-all"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-white/25" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-white/25 hover:text-white/50" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showSearch && searchQuery.length >= 2 ? (
        <div className="flex-1 overflow-y-auto px-5 pb-20">
          {isSearching ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-white/30 text-sm">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => router.push(`/profile/${user.user_id}`)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/[0.04] transition-all text-left"
                >
                  <Avatar
                    src={user.primary_photo}
                    alt={user.name}
                    size="md"
                    isVerified={user.is_verified}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {user.name}, {user.age}
                    </p>
                    {user.distance !== undefined && (
                      <p className="text-xs text-white/30 mt-0.5">
                        {Math.round(user.distance)} km away
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/15" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="w-10 h-10 text-white/10 mb-4" />
              <p className="text-white/30 text-sm">No users found</p>
              <p className="text-white/15 text-xs mt-1">Try searching by name</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Stories Section */}
          <div className="px-5 pt-3 pb-3">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {/* My Story */}
              <button
                className="flex flex-col items-center gap-2 shrink-0"
                onClick={() => {/* TODO: Create story */}}
              >
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center">
                  <div className="w-[58px] h-[58px] rounded-full bg-background flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className="text-[10px] text-white/40">My Story</span>
              </button>

              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    <Skeleton variant="circular" className="w-16 h-16" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                ))
              ) : (
                filteredStories.map((story) => (
                  <button
                    key={story.user_id}
                    className="flex flex-col items-center gap-2 shrink-0 group"
                    onClick={() => router.push(`/profile/${story.user_id}`)}
                  >
                    <div
                      className={cn(
                        "relative w-16 h-16 rounded-full p-[2px]",
                        story.has_unviewed
                          ? "bg-gradient-to-br from-primary to-primary-light"
                          : "bg-white/[0.15]"
                      )}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-background">
                        {story.primary_photo ? (
                          <Image
                            src={story.primary_photo}
                            alt={story.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
                            <span className="text-lg text-white/30">
                              {story.name[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-white/50 max-w-[60px] truncate group-hover:text-white transition-colors">
                      {story.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="h-px mx-5 bg-white/[0.06]" />

          {/* Your Dates Section */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25">
                Your Dates
              </h3>
              <button
                onClick={() => router.push("/discover")}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
              >
                Explore More
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-40 h-52 rounded-2xl shrink-0"
                    variant="rectangular"
                  />
                ))
              ) : filteredDates.length === 0 ? (
                <p className="text-white/20 text-sm py-6">
                  No dates available
                </p>
              ) : (
                filteredDates.map((date) => {
                  const online = date.is_online || isUserOnline(date.last_active_at);
                  return (
                    <button
                      key={date.user_id}
                      onClick={() => router.push(`/profile/${date.user_id}`)}
                      className="relative w-40 h-52 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.15] transition-all shrink-0 group"
                    >
                      {date.primary_photo ? (
                        <Image
                          src={date.primary_photo}
                          alt={date.name}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="160px"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                          <span className="text-2xl text-white/20">
                            {date.name[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Distance badge */}
                      {date.distance !== undefined && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full">
                          <span className="text-[10px] text-white/80">
                            {Math.round(date.distance)} km
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      <div className="absolute bottom-2.5 left-3 right-3">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-medium text-xs">
                            {date.name}, {date.age}
                          </p>
                          {online && (
                            <div className="w-2 h-2 rounded-full bg-success" />
                          )}
                        </div>
                        {date.sexual_orientation && (
                          <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">
                            {date.sexual_orientation}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="h-px mx-5 bg-white/[0.06]" />

          {/* Near You Section with Map */}
          <div className="px-5 pt-5 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25">
                Near You
              </h3>
              {mapDisplayUsers.length > 0 && (
                <button
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
                >
                  View Map
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isLoading ? (
              <Skeleton
                className="w-full h-52 rounded-2xl"
                variant="rectangular"
              />
            ) : mapDisplayUsers.length > 0 ? (
              <>
                {/* Real Map Preview — hide when full map modal is open */}
                {!showMapModal && (
                <div className="relative mb-4 isolate">
                  <NearbyMap
                    users={mapDisplayUsers}
                    center={userLocation || undefined}
                    height={220}
                    onUserClick={(userId) => router.push(`/profile/${userId}`)}
                  />
                  {/* Tap to expand */}
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors z-[1000]"
                  >
                    <span className="text-[11px] text-white/70">
                      {mapDisplayUsers.length} nearby · View full map
                    </span>
                  </button>
                </div>
                )}

                {/* Nearby users grid below map */}
                {nearby.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {nearby.slice(0, 8).map((user) => (
                      <button
                        key={user.user_id}
                        onClick={() => router.push(`/profile/${user.user_id}`)}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.15] transition-all group"
                      >
                        {user.primary_photo ? (
                          <Image
                            src={user.primary_photo}
                            alt={user.name}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 768px) 33vw, 25vw"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                            <span className="text-xl text-white/20">
                              {user.name[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {(user.is_online || isUserOnline(user.last_active_at)) && (
                          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-black/30" />
                        )}

                        <div className="absolute bottom-2 left-2">
                          <p className="text-white font-medium text-[11px]">
                            {user.name}
                          </p>
                          {user.distance !== undefined && (
                            <p className="text-white/40 text-[9px]">
                              {Math.round(user.distance)} km
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : nearby.length > 0 ? (
              /* No map data but have nearby users - show grid only */
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {nearby.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => router.push(`/profile/${user.user_id}`)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.15] transition-all group"
                  >
                    {user.primary_photo ? (
                      <Image
                        src={user.primary_photo}
                        alt={user.name}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        sizes="(max-width: 768px) 33vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                        <span className="text-xl text-white/20">
                          {user.name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {(user.is_online || isUserOnline(user.last_active_at)) && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-black/30" />
                    )}

                    <div className="absolute bottom-2 left-2">
                      <p className="text-white font-medium text-[11px]">
                        {user.name}
                      </p>
                      {user.distance !== undefined && (
                        <p className="text-white/40 text-[9px]">
                          {Math.round(user.distance)} km
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <MapPin className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/20 text-sm">
                  No users nearby with location enabled
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-6 pb-24 md:pb-6 md:mx-4 animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-300">
            {/* Handle (mobile only) */}
            <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-5 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Age Preference */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">Age Preference</p>
                <p className="text-sm text-white/30">{ageRange.min} - {ageRange.max} years</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/[0.04] rounded-xl p-3 border border-white/[0.08]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Min</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAgeRange((prev) => ({ ...prev, min: Math.max(18, prev.min - 1) }))}
                      className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-lg font-medium text-white">{ageRange.min}</span>
                    <button
                      onClick={() => setAgeRange((prev) => ({ ...prev, min: Math.min(prev.max - 1, prev.min + 1) }))}
                      className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <span className="text-white/20 text-sm">to</span>

                <div className="flex-1 bg-white/[0.04] rounded-xl p-3 border border-white/[0.08]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Max</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAgeRange((prev) => ({ ...prev, max: Math.max(prev.min + 1, prev.max - 1) }))}
                      className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-lg font-medium text-white">{ageRange.max}</span>
                    <button
                      onClick={() => setAgeRange((prev) => ({ ...prev, max: Math.min(99, prev.max + 1) }))}
                      className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Maximum Distance */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">Maximum Distance</p>
                <p className="text-sm text-white/30">{distance} km</p>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgba(229, 57, 53, 0.8) 0%, rgba(229, 57, 53, 0.8) ${distance}%, rgba(255,255,255,0.08) ${distance}%, rgba(255,255,255,0.08) 100%)`,
                }}
              />
            </div>

            {/* Apply — same as app: PUT /users/preferences then re-fetch /discovery/feed?limit=30 */}
            <button
              onClick={async () => {
                setIsApplyingFilters(true);
                try {
                  await apiPut(ENDPOINTS.USERS.PREFERENCES, {
                    age_min: ageRange.min,
                    age_max: ageRange.max,
                    proximity_range: distance,
                  });
                  await fetchDiscoveryFeed();
                } catch {
                  // Filter update failed
                } finally {
                  setIsApplyingFilters(false);
                  setShowFilters(false);
                }
              }}
              disabled={isApplyingFilters}
              className={cn(
                "w-full py-3.5 bg-gradient-to-r from-white/[0.12] to-white/[0.04] border border-white/[0.1] text-white text-sm font-medium rounded-xl hover:bg-white/[0.15] transition-all",
                isApplyingFilters && "opacity-60 cursor-not-allowed"
              )}
            >
              {isApplyingFilters ? "Applying..." : "Apply Filters"}
            </button>
          </div>
        </div>
      )}

      {/* Full Map Modal */}
      {showMapModal && (
        <>
        <div className="hidden md:block fixed inset-0 z-[55] bg-black/70" onClick={() => setShowMapModal(false)} />
        <div className="fixed inset-0 z-[55] bg-[#0a0a0a] flex flex-col animate-in slide-in-from-bottom duration-300 md:inset-8 md:rounded-2xl md:shadow-2xl md:m-auto md:max-w-5xl md:max-h-[85vh] md:overflow-hidden">
          {/* Map Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-base font-medium text-white">Nearby</h2>
              <span className="text-xs text-white/30">{mapDisplayUsers.length} users</span>
            </div>
            <button
              onClick={() => setShowMapModal(false)}
              className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Full Map */}
          <div className="flex-1 relative">
            <NearbyMap
              users={mapDisplayUsers}
              center={userLocation || undefined}
              height="100%"
              onUserClick={(userId) => router.push(`/profile/${userId}`)}
              className="!rounded-none !border-0 !h-full"
            />
          </div>
        </div>
        </>
      )}
    </div>
  );
}
