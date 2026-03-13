"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatchesStore } from "@/stores/matches.store";
import Header from "@/components/layout/Header";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { formatMessageTime } from "@/lib/utils/formatters";
import { Pin, MessageCircle } from "lucide-react";

export default function MatchesPage() {
  const router = useRouter();
  const { matches, isLoading, fetchMatches } = useMatchesStore();

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const pinnedMatches = matches.filter((m) => m.is_pinned);
  const newMatches = matches.filter(
    (m) => !m.is_pinned && !m.last_message
  );
  const conversations = matches
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

  return (
    <div className="h-full flex flex-col">
      <Header title="Matches" />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-14 h-14" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-48 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <MessageCircle className="w-16 h-16 text-text-muted mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No matches yet
            </h2>
            <p className="text-text-secondary text-center">
              Keep swiping to find your match!
            </p>
          </div>
        ) : (
          <>
            {/* New matches (horizontal scroll) */}
            {newMatches.length > 0 && (
              <div className="p-4 pb-0">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">
                  New Matches
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                  {newMatches.map((match) => (
                    <button
                      key={match.match_id}
                      onClick={() =>
                        router.push(`/chat/${match.conversation_id}`)
                      }
                      className="flex flex-col items-center gap-1.5 shrink-0"
                    >
                      <Avatar
                        src={match.user.primary_photo}
                        alt={match.user.name}
                        size="lg"
                        isOnline={match.user.is_online}
                        isVerified={match.user.is_verified}
                        borderColor="#E53935"
                      />
                      <span className="text-xs font-medium text-white max-w-[64px] truncate">
                        {match.user.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned conversations */}
            {pinnedMatches.length > 0 && (
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned
                </h3>
                {pinnedMatches.map((match) => (
                  <ConversationItem
                    key={match.match_id}
                    match={match}
                    onClick={() =>
                      router.push(`/chat/${match.conversation_id}`)
                    }
                  />
                ))}
              </div>
            )}

            {/* Conversations */}
            <div className="px-4 py-2">
              {(pinnedMatches.length > 0 || newMatches.length > 0) && (
                <h3 className="text-sm font-semibold text-text-secondary mb-2">
                  Messages
                </h3>
              )}
              {conversations.map((match) => (
                <ConversationItem
                  key={match.match_id}
                  match={match}
                  onClick={() =>
                    router.push(`/chat/${match.conversation_id}`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  match,
  onClick,
}: {
  match: ReturnType<typeof useMatchesStore.getState>["matches"][number];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-card transition-colors text-left"
    >
      <Avatar
        src={match.user.primary_photo}
        alt={match.user.name}
        size="md"
        isOnline={match.user.is_online}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-sm truncate">
            {match.user.name}
          </span>
          {match.last_message?.sent_at && (
            <span className="text-xs text-text-muted shrink-0 ml-2">
              {formatMessageTime(new Date(match.last_message.sent_at))}
            </span>
          )}
        </div>
        {match.last_message && (
          <p
            className={cn(
              "text-sm truncate",
              match.unread_count > 0
                ? "text-white font-medium"
                : "text-text-muted"
            )}
          >
            {match.last_message.is_from_me && "You: "}
            {match.last_message.content}
          </p>
        )}
      </div>

      {match.unread_count > 0 && (
        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {match.unread_count > 9 ? "9+" : match.unread_count}
        </span>
      )}
    </button>
  );
}
