"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFeedStore } from "@/stores/feed.store";
import { useUIStore } from "@/stores/ui.store";
import SwipeCard from "@/components/feed/SwipeCard";
import SwipeActions from "@/components/feed/SwipeActions";
import MatchModal from "@/components/feed/MatchModal";
import Header from "@/components/layout/Header";
import Skeleton from "@/components/ui/Skeleton";
import { RefreshCw, Flame } from "lucide-react";

export default function FeedPage() {
  const router = useRouter();
  const {
    users,
    currentIndex,
    isLoading,
    error,
    matchData,
    dailyLimits,
    fetchFeed,
    like,
    superLike,
    pass,
    nextCard,
    fetchDailyLimits,
    clearMatchData,
  } = useFeedStore();

  useEffect(() => {
    fetchFeed();
    fetchDailyLimits();
  }, [fetchFeed, fetchDailyLimits]);

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const handleSwipe = useCallback(
    async (direction: "left" | "right" | "up") => {
      if (!currentUser) return;

      try {
        if (direction === "right") {
          await like(currentUser.user_id);
        } else if (direction === "up") {
          await superLike(currentUser.user_id);
        } else {
          await pass(currentUser.user_id);
        }
        nextCard();
      } catch {
        // handled by store
      }
    },
    [currentUser, like, superLike, pass, nextCard]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
      if (e.key === "ArrowUp") handleSwipe("up");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentUser, handleSwipe]);

  // Load more when running low
  useEffect(() => {
    if (currentIndex >= users.length - 3 && users.length > 0 && !isLoading) {
      fetchFeed();
    }
  }, [currentIndex, users.length, isLoading, fetchFeed]);

  return (
    <div className="h-full flex flex-col">
      <Header title="Discover">
        {dailyLimits && dailyLimits.swipes.remaining !== null && (
          <span className="text-sm text-text-secondary">
            {dailyLimits.swipes.remaining} swipes left
          </span>
        )}
      </Header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {isLoading && users.length === 0 ? (
          <div className="w-full max-w-[400px] aspect-[3/4.5] rounded-3xl">
            <Skeleton className="w-full h-full rounded-3xl" variant="rectangular" />
          </div>
        ) : !currentUser ? (
          <div className="text-center py-20">
            <Flame className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No more profiles
            </h2>
            <p className="text-text-secondary mb-6">
              Check back later for new people
            </p>
            <button
              onClick={fetchFeed}
              className="flex items-center gap-2 mx-auto text-primary hover:text-primary-light transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Card stack */}
            <div className="relative w-full max-w-[400px] aspect-[3/4.5]">
              {nextUser && (
                <SwipeCard key={nextUser.user_id} user={nextUser} onSwipe={() => {}} />
              )}
              <SwipeCard
                key={currentUser.user_id}
                user={currentUser}
                onSwipe={handleSwipe}
                isTop
              />
            </div>

            {/* Action buttons */}
            <SwipeActions
              onPass={() => handleSwipe("left")}
              onLike={() => handleSwipe("right")}
              onSuperLike={() => handleSwipe("up")}
            />

            {/* Keyboard hint */}
            <p className="text-text-muted text-xs hidden md:block">
              Use arrow keys: ← Pass · → Like · ↑ Super Like
            </p>
          </>
        )}
      </div>

      {/* Match modal */}
      {matchData && (
        <MatchModal
          isOpen={!!matchData}
          userName={matchData.userName}
          userPhoto={matchData.userPhoto}
          conversationId={matchData.conversationId}
          onClose={clearMatchData}
          onMessage={() => {
            clearMatchData();
            router.push(`/chat/${matchData.conversationId}`);
          }}
        />
      )}
    </div>
  );
}
