import { create } from "zustand";
import { get as apiGet, put, del } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiMatch, MatchesResponse } from "@/lib/api/types";

interface MatchesState {
  matches: ApiMatch[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

interface MatchesActions {
  fetchMatches: () => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
  pinMatch: (matchId: string) => Promise<void>;
  unpinMatch: (matchId: string) => Promise<void>;
  updateLastMessage: (
    matchId: string,
    message: { content: string; sent_at: string; is_from_me: boolean }
  ) => void;
}

export const useMatchesStore = create<MatchesState & MatchesActions>()(
  (set) => ({
    matches: [],
    total: 0,
    isLoading: false,
    error: null,

    fetchMatches: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiGet<MatchesResponse>(
          ENDPOINTS.INTERACTIONS.MATCHES
        );
        set({
          matches: response.data.matches,
          total: response.data.total,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to load matches",
          isLoading: false,
        });
      }
    },

    unmatch: async (matchId) => {
      await del(ENDPOINTS.INTERACTIONS.UNMATCH(matchId));
      set((state) => ({
        matches: state.matches.filter((m) => m.match_id !== matchId),
        total: state.total - 1,
      }));
    },

    pinMatch: async (matchId) => {
      await put(ENDPOINTS.INTERACTIONS.PIN_MATCH(matchId));
      set((state) => ({
        matches: state.matches.map((m) =>
          m.match_id === matchId ? { ...m, is_pinned: true } : m
        ),
      }));
    },

    unpinMatch: async (matchId) => {
      await put(ENDPOINTS.INTERACTIONS.UNPIN_MATCH(matchId));
      set((state) => ({
        matches: state.matches.map((m) =>
          m.match_id === matchId ? { ...m, is_pinned: false } : m
        ),
      }));
    },

    updateLastMessage: (matchId, message) => {
      set((state) => ({
        matches: state.matches.map((m) =>
          m.match_id === matchId
            ? {
                ...m,
                last_message: { message_id: "", ...message },
                unread_count: message.is_from_me
                  ? m.unread_count
                  : m.unread_count + 1,
              }
            : m
        ),
      }));
    },
  })
);
