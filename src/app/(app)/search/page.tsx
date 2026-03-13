"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import { Search as SearchIcon, MapPin } from "lucide-react";
import type { SearchResponse, SearchUser } from "@/lib/api/types";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiGet<SearchResponse>(ENDPOINTS.SEARCH, {
        q: q.trim(),
      });
      setResults(response.data.users || []);
      setHasSearched(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="h-full flex flex-col">
      <Header title="Search" />

      <div className="p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          icon={<SearchIcon className="w-5 h-5" />}
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {isSearching ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="space-y-1.5">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              No results for &quot;{query}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((user) => (
              <button
                key={user.user_id}
                onClick={() => router.push(`/profile/${user.user_id}`)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-card transition-colors text-left"
              >
                <Avatar
                  src={user.primary_photo}
                  alt={user.name}
                  size="md"
                  isVerified={user.is_verified}
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.name}, {user.age}
                  </p>
                  {user.location_city && (
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location_city}
                      {user.distance !== undefined &&
                        ` · ${Math.round(user.distance)} km`}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
