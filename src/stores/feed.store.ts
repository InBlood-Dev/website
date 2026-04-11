import { create } from "zustand";
import { get as apiGet, post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { posthog } from "@/lib/analytics/posthog";
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
  undoCard: () => void;
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
    const state = get();
    // Don't refetch if we already have profiles ahead
    if (state.users.length > 0 && state.currentIndex < state.users.length - 2 && !state.error) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiGet<any>(
        ENDPOINTS.DISCOVERY.FEED,
        { limit: 30, offset: state.users.length > 0 ? state.users.length : 0 }
      );
      // Backend returns profiles (not users), with primary_photo sometimes null
      const rawProfiles = response.data?.profiles || response.data?.users || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newUsers = rawProfiles.map((p: any) => ({
        ...p,
        user_id: p.user_id || p._id,
        primary_photo: p.primary_photo || p.photos?.[0] || null,
        tags: Array.isArray(p.tags) ? p.tags : [],
        relationship_types: Array.isArray(p.relationship_types) ? p.relationship_types : [],
      }));

      // If this is the first load, set users and reset index
      // Otherwise append to existing users
      if (state.users.length === 0) {
        set({
          users: newUsers,
          currentIndex: 0,
          isLoading: false,
        });
      } else {
        // Deduplicate by user_id
        const existingIds = new Set(state.users.map((u) => u.user_id));
        const unique = newUsers.filter((u: RecommendedUser) => !existingIds.has(u.user_id));
        set({
          users: [...state.users, ...unique],
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load feed",
        isLoading: false,
      });
    }
  },

  like: async (userId) => {
    const response = await post<LikeResponse>(ENDPOINTS.INTERACTIONS.LIKE, {
      target_user_id: userId,
    });

    posthog?.capture("discovery_like", { matched: !!response.data.is_matched });

    if (response.data.is_matched && response.data.match) {
      posthog?.capture("match_created", { source: "like" });
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
      { target_user_id: userId }
    );

    posthog?.capture("discovery_super_like", { matched: !!response.data.is_matched });

    if (response.data.is_matched && response.data.match) {
      posthog?.capture("match_created", { source: "super_like" });
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

  pass: async (userId) => {
    posthog?.capture("discovery_pass");
    const response = await post<PassResponse>(ENDPOINTS.INTERACTIONS.PASS, {
      target_user_id: userId,
    });
    return response.data;
  },

  nextCard: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },

  undoCard: () => {
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    }));
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
