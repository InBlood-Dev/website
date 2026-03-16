"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMatchesStore } from "@/stores/matches.store";
import { useAuthStore } from "@/stores/auth.store";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { formatMessageTime } from "@/lib/utils/formatters";
import { Pin, MessageCircle, Heart } from "lucide-react";
import type { ApiMatch } from "@/lib/api/types";

export default function MatchesPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const {
    matches,
    conversations,
    isLoading,
    hasFetchedOnce,
    pendingLikesCount,
    fetchMatches,
    fetchConversations,
    fetchPendingLikes,
    startFirebaseListener,
    subscribeToLastMessages,
    hydrateLastMessages,
  } = useMatchesStore();

  // Fetch on mount — only if we haven't fetched yet, otherwise silently refresh
  useEffect(() => {
    fetchMatches();
    fetchConversations(userId);
    fetchPendingLikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Start Firebase real-time listener (persists across navigations — no cleanup on unmount)
  useEffect(() => {
    if (userId) {
      startFirebaseListener(userId);
    }
    // Intentionally no cleanup — listener should persist across page navigations
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Hydrate last messages from Firebase (one-shot read) + subscribe for real-time updates
  useEffect(() => {
    const allConvIds = [
      ...matches.map((m) => m.conversation_id),
      ...conversations.map((c) => c.conversation_id),
    ].filter(Boolean);
    if (allConvIds.length > 0) {
      // One-shot read fills in last_message for matches that API didn't populate
      hydrateLastMessages(allConvIds);
      // Real-time subscription for ongoing updates
      subscribeToLastMessages(allConvIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches.length, conversations.length]);

  // Merge matches + non-matched conversations for display
  const allItems = [...matches, ...conversations];

  const pinnedItems = allItems.filter((m) => m.is_pinned);
  const newMatches = matches.filter(
    (m) => !m.is_pinned && !m.last_message
  );
  const activeConversations = allItems
    .filter((m) => !m.is_pinned && m.last_message)
    .sort((a, b) => {
      const aTime = a.last_message?.sent_at
        ? new Date(a.last_message.sent_at).getTime()
        : 0;
      const bTime = b.last_message?.sent_at
        ? new Date(b.last_message.sent_at).getTime()
        : 0;
      return bTime - aTime;
    });

  // Only show skeleton on very first load (no data yet)
  const showSkeleton = isLoading && !hasFetchedOnce;

  return (
    <div className="h-full flex flex-col">
      {/* Red gradient header section (matching mobile) */}
      <div className="bg-gradient-to-b from-primary to-primary-dark">
        {/* Header title */}
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-[22px] font-bold text-white">Messages</h1>
        </div>

        {/* New Matches horizontal carousel */}
        <div className="px-5 pb-5">
          <p className="text-white/90 text-sm font-semibold mb-3">New Matches</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {/* Likes Card */}
            <button
              onClick={() => router.push("/likes")}
              className="shrink-0"
            >
              <div className="w-[100px] h-[130px] rounded-xl overflow-hidden bg-gradient-to-br from-[#FF6B6B] to-primary flex flex-col items-center justify-center">
                <div className="w-[50px] h-[50px] rounded-full bg-white/20 flex items-center justify-center mb-1">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <span className="text-2xl font-extrabold text-white">{pendingLikesCount}</span>
                <span className="text-sm font-semibold text-white/90">Likes</span>
              </div>
            </button>

            {/* New match profile cards */}
            {newMatches.map((match) => (
              <button
                key={match.match_id}
                onClick={() => router.push(`/chat/${match.conversation_id}`)}
                className="shrink-0"
              >
                <div className="w-[100px] h-[130px] rounded-xl overflow-hidden bg-card relative">
                  {match.user.primary_photo ? (
                    <Image
                      src={match.user.primary_photo}
                      alt={match.user.name}
                      fill
                      className="object-cover"
                      sizes="100px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.06]">
                      <span className="text-4xl text-white/30">{match.user.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-1">
                    <p className="text-sm font-semibold text-white text-center truncate">
                      {match.user.name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dark chat list section (bottom sheet style) */}
      <div className="flex-1 bg-background -mt-5 rounded-t-3xl overflow-hidden flex flex-col relative z-10">
        {/* Handle indicator */}
        <div className="flex items-center justify-center py-2.5">
          <div className="w-10 h-1 rounded-full bg-white/[0.1]" />
        </div>

        <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {showSkeleton ? (
            <div className="px-4 space-y-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton variant="circular" className="w-14 h-14" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : allItems.length === 0 && hasFetchedOnce ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
              <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-white/15" />
              </div>
              <h2 className="text-lg font-medium text-white mb-2 tracking-tight">
                No messages yet
              </h2>
              <p className="text-white/30 text-center text-sm max-w-xs leading-relaxed">
                When you match with someone, start a conversation here!
              </p>
            </div>
          ) : (
            <div className="px-4">
              {/* Pinned conversations */}
              {pinnedItems.length > 0 && (
                <div className="pt-2 pb-1">
                  <SectionHeader title="Pinned" count={pinnedItems.length} />
                  {pinnedItems.map((match) => (
                    <ChatItem
                      key={match.match_id}
                      match={match}
                      onClick={() => router.push(`/chat/${match.conversation_id}`)}
                    />
                  ))}
                </div>
              )}

              {/* New Matches in list */}
              {newMatches.length > 0 && (
                <div className="pt-2 pb-1">
                  <SectionHeader title="New Matches" count={newMatches.length} />
                  {newMatches.map((match) => (
                    <ChatItem
                      key={match.match_id}
                      match={match}
                      showNewBadge
                      onClick={() => router.push(`/chat/${match.conversation_id}`)}
                    />
                  ))}
                </div>
              )}

              {/* Regular conversations (matched + non-matched merged) */}
              {activeConversations.length > 0 && (
                <div className="pt-2 pb-1">
                  {(pinnedItems.length > 0 || newMatches.length > 0) && (
                    <SectionHeader title="Messages" />
                  )}
                  {activeConversations.map((match) => (
                    <ChatItem
                      key={match.match_id}
                      match={match}
                      onClick={() => router.push(`/chat/${match.conversation_id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="py-2 pt-4">
      <p className="text-sm font-semibold text-white uppercase tracking-wide">
        {title}
        {count !== undefined && count > 0 && (
          <span className="text-white/30 font-medium"> ({count})</span>
        )}
      </p>
    </div>
  );
}

// ─── Chat Item (matching mobile ChatItem) ────────────────────────

function ChatItem({
  match,
  onClick,
  showNewBadge = false,
}: {
  match: ApiMatch;
  onClick: () => void;
  showNewBadge?: boolean;
}) {
  const hasUnread = match.unread_count > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full py-3 px-2 rounded-xl transition-all text-left border-b border-white/[0.04]",
        hasUnread
          ? "bg-primary/[0.06] border-l-[3px] border-l-primary"
          : "hover:bg-white/[0.04]"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-14 h-14 rounded-full overflow-hidden",
            hasUnread ? "ring-2 ring-primary" : ""
          )}
        >
          {match.user.primary_photo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={match.user.primary_photo}
              alt={match.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card text-white/30 text-xl font-bold">
              {match.user.name.charAt(0)}
            </div>
          )}
        </div>
        {showNewBadge && (
          <div className="absolute -top-1 -right-1 bg-primary px-1.5 py-0.5 rounded-md border-2 border-background">
            <span className="text-[9px] font-extrabold text-white tracking-wide">NEW</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <span
            className={cn(
              "text-base truncate flex-1",
              hasUnread ? "font-bold text-white" : "font-medium text-white"
            )}
          >
            {match.user.name}
          </span>
          {match.is_pinned && (
            <Pin className="w-3.5 h-3.5 text-primary rotate-45 shrink-0" />
          )}
        </div>
        <p
          className={cn(
            "text-sm truncate",
            hasUnread ? "text-white font-medium" : "text-white/40"
          )}
        >
          {match.last_message
            ? `${match.last_message.is_from_me ? "You: " : ""}${match.last_message.content}`
            : "Say hello! \uD83D\uDC4B"}
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end shrink-0 gap-1.5">
        {match.last_message?.sent_at && (
          <span
            className={cn(
              "text-xs",
              hasUnread ? "text-primary font-semibold" : "text-white/25"
            )}
          >
            {formatMessageTime(new Date(match.last_message.sent_at))}
          </span>
        )}
        {hasUnread && (
          <span className="min-w-[22px] h-[22px] rounded-full bg-primary text-white text-[11px] font-extrabold flex items-center justify-center px-1.5">
            {match.unread_count > 9 ? "9+" : match.unread_count}
          </span>
        )}
      </div>
    </button>
  );
}
