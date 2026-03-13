import { create } from "zustand";
import { get as apiGet, post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  RecommendedUser,
  DiscoveryFeedResponse,
  LikeResponse,
  SuperLikeResponse,
  PassResponse,
  DailyLimitsResponse,
} from "@/lib/api/types";

interface FeedState {
  users: RecommendedUser[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  dailyLimits: DailyLimitsResponse | null;
  matchData: {
    matchId: string;
    conversationId: string;
    userName: string;
    userPhoto: string;
  } | null;
}

interface FeedActions {
  fetchFeed: () => Promise<void>;
  like: (userId: string) => Promise<LikeResponse>;
  superLike: (userId: string) => Promise<SuperLikeResponse>;
  pass: (userId: string) => Promise<PassResponse>;
  nextCard: () => void;
  fetchDailyLimits: () => Promise<void>;
  clearMatchData: () => void;
}

export const useFeedStore = create<FeedState & FeedActions>()((set, get) => ({
  users: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  dailyLimits: null,
  matchData: null,

  fetchFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGet<DiscoveryFeedResponse>(
        ENDPOINTS.DISCOVERY.FEED
      );
      set({
        users: response.data.users,
        currentIndex: 0,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load feed",
        isLoading: false,
      });
    }
  },

  like: async (userId) => {
    const response = await post<LikeResponse>(ENDPOINTS.INTERACTIONS.LIKE, {
      liked_user_id: userId,
    });

    if (response.data.is_matched && response.data.match) {
      const user = get().users.find((u) => u.user_id === userId);
      set({
        matchData: {
          matchId: response.data.match.match_id,
          conversationId: response.data.match.conversation_id,
          userName: user?.name || "",
          userPhoto: user?.primary_photo || "",
        },
      });
    }

    if (response.data.swipes_remaining !== null) {
      set((state) => ({
        dailyLimits: state.dailyLimits
          ? {
              ...state.dailyLimits,
              swipes: {
                ...state.dailyLimits.swipes,
                remaining: response.data.swipes_remaining,
              },
            }
          : null,
      }));
    }

    return response.data;
  },

  superLike: async (userId) => {
    const response = await post<SuperLikeResponse>(
      ENDPOINTS.INTERACTIONS.SUPER_LIKE,
      { liked_user_id: userId }
    );

    if (response.data.is_matched && response.data.match) {
      const user = get().users.find((u) => u.user_id === userId);
      set({
        matchData: {
          matchId: response.data.match.match_id,
          conversationId: response.data.match.conversation_id,
          userName: user?.name || "",
          userPhoto: user?.primary_photo || "",
        },
      });
    }

    return response.data;
  },

  pass: async (userId) => {
    const response = await post<PassResponse>(ENDPOINTS.INTERACTIONS.PASS, {
      passed_user_id: userId,
    });
    return response.data;
  },

  nextCard: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },

  fetchDailyLimits: async () => {
    try {
      const response = await apiGet<DailyLimitsResponse>(
        ENDPOINTS.INTERACTIONS.DAILY_LIMITS
      );
      set({ dailyLimits: response.data });
    } catch {
      // non-critical
    }
  },

  clearMatchData: () => {
    set({ matchData: null });
  },
}));
