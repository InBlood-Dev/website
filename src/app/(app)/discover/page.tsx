"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet, put as apiPut } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import InfiniteGrid from "@/components/ui/InfiniteGrid";
import { cn } from "@/lib/utils/cn";
import {
  Compass,
  LocateFixed,
  SlidersHorizontal,
  Search,
  X,
  Heart,
  Coffee,
  Users,
  Diamond,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { SearchResponse, SearchUser } from "@/lib/api/types";

interface DisplayProfile {
  user_id: string;
  name: string;
  age: number;
  distance?: number;
  primary_photo: string | null;
  is_online?: boolean;
  last_active_at?: string;
  relationship_types?: Array<{ type: string; border_color: string }>;
  bio?: string;
  match_score?: number;
}

const RELATIONSHIP_TYPES = [
  { id: "long-term", label: "Long-term", icon: Heart, color: "#FF69B4" },
  { id: "casual", label: "Casual", icon: Coffee, color: "#FF6347" },
  { id: "friendship", label: "Friendship", icon: Users, color: "#FFD700" },
  { id: "marriage", label: "Marriage", icon: Diamond, color: "#9370DB" },
  { id: "open", label: "Open to All", icon: Sparkles, color: "#32CD32" },
] as const;

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

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [selectedRelType, setSelectedRelType] = useState<string | null>(null);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const locationSent = useRef(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters = onlineOnly || selectedRelType !== null;

  const updateLocation = useCallback(async (): Promise<boolean> => {
    if (locationSent.current) return true;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });
      await apiPut(ENDPOINTS.USERS.LOCATION, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      locationSent.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadProfiles = useCallback(async (currentOffset: number, relType?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      setNeedsLocation(false);

      let loaded: DisplayProfile[] = [];
      let more = false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = { limit: LIMIT, offset: currentOffset };
      const filterRelType = relType !== undefined ? relType : selectedRelType;
      if (filterRelType) {
        params.relationship_type = filterRelType;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiGet<any>(ENDPOINTS.DISCOVERY.GALLERY, params);
        const rawProfiles = response.data?.profiles || response.data?.users || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loaded = rawProfiles.map((u: any) => ({
          user_id: u.user_id,
          name: u.name,
          age: u.age,
          distance: u.distance,
          primary_photo: u.primary_photo || u.photos?.[0] || null,
          is_online: u.is_online,
          last_active_at: u.last_active_at,
          relationship_types: u.relationship_types,
          bio: u.bio,
          match_score: u.match_score,
        }));
        more = response.data?.has_more ?? loaded.length >= LIMIT;
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.toLowerCase().includes("location")) {
          setNeedsLocation(true);
          setIsLoading(false);
          return;
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const response = await apiGet<any>(ENDPOINTS.DISCOVERY.FEED, params);
          const rawProfiles = response.data?.profiles || response.data?.users || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          loaded = rawProfiles.map((u: any) => ({
            user_id: u.user_id,
            name: u.name,
            age: u.age,
            distance: u.distance,
            primary_photo: u.primary_photo || u.photos?.[0] || null,
            is_online: u.is_online,
            last_active_at: u.last_active_at,
            relationship_types: u.relationship_types,
            bio: u.bio,
            match_score: u.match_score,
          }));
          more = response.data?.has_more ?? loaded.length >= LIMIT;
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
    } catch {
      setError("Failed to load profiles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRelType]);

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
    updateLocation().then(() => loadProfiles(0));
  }, [updateLocation, loadProfiles]);

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
        });
        setSearchResults(response.data?.users || response.data?.profiles || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  // Desktop: infinite scroll sentinel
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextOffset = offset + LIMIT;
      setOffset(nextOffset);
      loadProfiles(nextOffset);
    }
  }, [isLoading, hasMore, offset, loadProfiles]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleFilterApply = (relType: string | null, online: boolean) => {
    setSelectedRelType(relType);
    setOnlineOnly(online);
    setShowFilters(false);
    setOffset(0);
    loadProfiles(0, relType);
  };

  // Client-side online filter
  const filteredProfiles = onlineOnly
    ? profiles.filter((p) => p.is_online)
    : profiles;

  // Active filter color
  const activeFilterColor = selectedRelType
    ? RELATIONSHIP_TYPES.find((t) => t.id === selectedRelType)?.color
    : null;

  // Profiles formatted for the InfiniteGrid component
  const gridProfiles = useMemo(
    () =>
      filteredProfiles.map((p) => ({
        user_id: p.user_id,
        name: p.name,
        age: p.age,
        primary_photo: p.primary_photo,
        is_online: p.is_online,
        borderColor:
          activeFilterColor ||
          p.relationship_types?.[0]?.border_color ||
          "rgba(255,255,255,0.06)",
      })),
    [filteredProfiles, activeFilterColor]
  );

  // Show loading/error/empty states?
  const showStates = needsLocation || error || (!isLoading && profiles.length === 0) ||
    (onlineOnly && !isLoading && filteredProfiles.length === 0 && profiles.length > 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <button
          onClick={() => setShowFilters(true)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all relative",
            hasActiveFilters
              ? "bg-primary/20 border border-primary"
              : "bg-white/[0.06] hover:bg-white/[0.1]"
          )}
        >
          <SlidersHorizontal className="w-5 h-5 text-white" />
          {hasActiveFilters && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary" />
          )}
        </button>
        <h1 className="text-base font-medium text-white">Explore</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-all"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 md:px-6">
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-white/25" />
            <input
              type="text"
              placeholder="Search by name..."
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
      {showSearch && searchQuery.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-20">
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
              <p className="text-white/15 text-xs mt-1">Try a different name</p>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {!(showSearch && searchQuery.length > 0) && (
        <>
          {/* State screens (location / error / empty) */}
          {showStates && (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {needsLocation && !isLoading && (
                <>
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-[15px]" />
                    <div className="relative z-10 w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <LocateFixed className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-lg font-medium text-white mb-2 tracking-tight">Enable Location</h2>
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
                </>
              )}

              {error && !needsLocation && !isLoading && (
                <>
                  <Compass className="w-10 h-10 text-white/10 mb-5" />
                  <p className="text-white/30 text-sm text-center mb-4 max-w-xs">{error}</p>
                  <button
                    onClick={() => { setOffset(0); setError(null); updateLocation().then(() => loadProfiles(0)); }}
                    className="px-6 py-2.5 bg-primary/20 border border-primary/30 rounded-full text-white text-sm hover:bg-primary/30 transition-all"
                  >
                    Retry
                  </button>
                </>
              )}

              {onlineOnly && !isLoading && filteredProfiles.length === 0 && profiles.length > 0 && (
                <>
                  <div className="w-4 h-4 rounded-full bg-white/20 mb-4" />
                  <p className="text-white/30 text-sm">No one is online right now</p>
                  <p className="text-white/15 text-xs mt-1">Check back in a bit</p>
                </>
              )}

              {!error && !needsLocation && !isLoading && profiles.length === 0 && (
                <>
                  <Compass className="w-10 h-10 text-white/10 mb-5" />
                  <h2 className="text-lg font-medium text-white mb-2 tracking-tight">No profiles found</h2>
                  <p className="text-white/30 text-sm text-center max-w-xs">
                    Try changing your filters or expanding distance preferences
                  </p>
                  <button
                    onClick={() => { setOffset(0); loadProfiles(0); }}
                    className="mt-6 px-6 py-2.5 bg-primary/20 border border-primary/30 rounded-full text-white text-sm hover:bg-primary/30 transition-all"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          )}

          {/* Initial loading shimmer */}
          {isLoading && profiles.length === 0 && !needsLocation && !error && (
            <div className="flex-1 p-4 md:p-6">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-xl" variant="rectangular" />
                ))}
              </div>
            </div>
          )}

          {/* Profiles loaded — show grid */}
          {!showStates && filteredProfiles.length > 0 && (
            <>
              {/* MOBILE: 360° infinite drag grid (same as app) */}
              <InfiniteGrid
                profiles={gridProfiles}
                onProfileClick={(userId) => router.push(`/profile/${userId}`)}
                className="md:hidden px-2"
              />

              {/* DESKTOP: Normal scrollable grid with infinite scroll */}
              <div className="hidden md:block flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile.user_id}
                      onClick={() => router.push(`/profile/${profile.user_id}`)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.04] transition-all duration-300"
                      style={{
                        borderWidth: 2,
                        borderColor: activeFilterColor || profile.relationship_types?.[0]?.border_color || "rgba(255,255,255,0.06)",
                      }}
                    >
                      {profile.primary_photo ? (
                        <Image
                          src={profile.primary_photo}
                          alt={profile.name}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 1024px) 25vw, 20vw"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                          <span className="text-2xl text-white/20">{profile.name?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {profile.is_online && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-black/30" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-white font-medium text-xs truncate">{profile.name}</p>
                        <p className="text-white/50 text-[10px]">{profile.age}</p>
                      </div>
                    </button>
                  ))}
                  {isLoading && Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={`s-${i}`} className="aspect-[3/4] rounded-xl" variant="rectangular" />
                  ))}
                </div>
                <div ref={sentinelRef} className="h-1" />
                {isLoading && profiles.length > 0 && (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          selectedRelType={selectedRelType}
          onlineOnly={onlineOnly}
          onApply={handleFilterApply}
        />
      )}
    </div>
  );
}

function FilterModal({
  onClose,
  selectedRelType,
  onlineOnly: initialOnlineOnly,
  onApply,
}: {
  onClose: () => void;
  selectedRelType: string | null;
  onlineOnly: boolean;
  onApply: (relType: string | null, onlineOnly: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(selectedRelType);
  const [online, setOnline] = useState(initialOnlineOnly);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-6 pb-24 md:pb-6 md:mx-4 animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-300">
        <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-5 md:hidden" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-white">Filters</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center hover:bg-white/[0.15] transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <button
          onClick={() => setOnline(!online)}
          className={cn(
            "flex items-center gap-3 w-full p-4 rounded-xl border-2 mb-6 transition-all",
            online ? "bg-success/10 border-success" : "bg-white/[0.03] border-white/[0.08]"
          )}
        >
          <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", online ? "bg-success" : "bg-white/20")} />
          <span className={cn("text-sm font-medium transition-colors", online ? "text-success" : "text-white/40")}>
            Online Now
          </span>
        </button>

        <p className="text-sm font-medium text-white mb-1">Looking For</p>
        <p className="text-xs text-white/30 mb-4">Select none to show all</p>

        <div className="space-y-2 mb-8">
          {RELATIONSHIP_TYPES.map((type) => {
            const isSelected = selected === type.id;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelected(isSelected ? null : type.id)}
                className={cn(
                  "flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all",
                  isSelected ? "border-current" : "bg-white/[0.03] border-white/[0.08]"
                )}
                style={isSelected ? { backgroundColor: `${type.color}20`, borderColor: type.color, color: type.color } : {}}
              >
                <Icon className="w-[18px] h-[18px]" style={{ color: type.color }} />
                <span
                  className={cn("text-sm font-medium", !isSelected && "text-white/40")}
                  style={isSelected ? { color: type.color } : {}}
                >
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onApply(selected, online)}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
