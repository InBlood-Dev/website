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
import Image from "next/image";
import { RefreshCw } from "lucide-react";

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

  const currentUser = users?.[currentIndex];
  const nextUser = users?.[currentIndex + 1];

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
    if (currentIndex >= (users?.length ?? 0) - 3 && (users?.length ?? 0) > 0 && !isLoading) {
      fetchFeed();
    }
  }, [currentIndex, users?.length, isLoading, fetchFeed]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Ambient background glow */}
      <div className="fixed top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.025] blur-[120px] pointer-events-none" />

      <Header title="Discover">
        {dailyLimits && dailyLimits.swipes.remaining !== null && (
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-20 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((dailyLimits.swipes.remaining || 0) / (dailyLimits.swipes.daily_limit || 1)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-white/25 uppercase tracking-wider">
              {dailyLimits.swipes.remaining} left
            </span>
          </div>
        )}
      </Header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-8 relative z-10">
        {isLoading && (users?.length ?? 0) === 0 ? (
          <div className="w-full max-w-[400px] aspect-[3/4.5] rounded-2xl">
            <Skeleton className="w-full h-full rounded-2xl" variant="rectangular" />
          </div>
        ) : !currentUser ? (
          <div className="text-center py-20 max-w-xs mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-[15px]" />
              <div className="relative z-10 w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Image src="/logo.png" alt="InBlood" width={40} height={40} className="rounded-xl" />
              </div>
            </div>
            <h2 className="text-2xl font-light text-white mb-2 tracking-tight">
              No more <span className="gradient-text font-medium">profiles</span>
            </h2>
            <p className="text-white/25 mb-10 text-sm leading-relaxed">
              Check back later for new people near you
            </p>
            <button
              onClick={fetchFeed}
              className="inline-flex items-center gap-2.5 px-7 py-3 bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.06] transition-all text-sm rounded-full"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Card stack with glow */}
            <div className="relative w-full max-w-[400px] aspect-[3/4.5]">
              <div className="absolute inset-x-4 -bottom-4 h-20 bg-primary/[0.04] blur-[30px] rounded-full" />
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
            <p className="text-white/[0.07] text-[11px] hidden md:block tracking-[0.2em] uppercase">
              Arrow Keys: Pass / Like / Super Like
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
