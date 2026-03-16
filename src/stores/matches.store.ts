import { create } from "zustand";
import { get as apiGet, post, del } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiMatch,
  MatchesResponse,
  PendingLikesResponse,
} from "@/lib/api/types";
import {
  subscribeToUserConversations,
  subscribeToLastMessage,
  type FirebaseLastMessage,
} from "@/lib/firebase/messaging";
import { initializeFirebase } from "@/lib/firebase/config";
import { waitForFirebaseAuth } from "@/lib/firebase/auth";

// Shape for non-matched conversations from GET /conversations
export interface ApiConversation {
  conversation_id: string;
  other_user: {
    user_id: string;
    name: string;
    primary_photo: string;
    is_verified?: boolean;
    is_online?: boolean;
    last_active_at?: string;
  };
  last_message?: {
    content: string;
    sender_id: string;
    sent_at: string;
    message_type?: string;
  };
  last_message_at?: string;
  unread_count?: number;
  is_matched?: boolean;
  is_pinned?: boolean;
}

interface ConversationsResponse {
  conversations: ApiConversation[];
}

// Normalize non-matched conversation into ApiMatch shape for unified rendering
const conversationToMatch = (
  conv: ApiConversation,
  currentUserId: string | null
): ApiMatch => ({
  match_id: conv.conversation_id,
  conversation_id: conv.conversation_id,
  user: {
    user_id: conv.other_user.user_id,
    name: conv.other_user.name,
    age: 0,
    primary_photo: conv.other_user.primary_photo || "",
    is_verified: conv.other_user.is_verified ?? false,
    is_online: conv.other_user.is_online ?? false,
    last_active_at: conv.other_user.last_active_at,
  },
  matched_at: conv.last_message_at || new Date().toISOString(),
  is_active: true,
  is_pinned: conv.is_pinned ?? false,
  last_message: conv.last_message
    ? {
        message_id: `last-${conv.conversation_id}`,
        content: conv.last_message.content,
        sent_at: conv.last_message.sent_at,
        is_from_me: conv.last_message.sender_id === currentUserId,
      }
    : undefined,
  unread_count: conv.unread_count ?? 0,
});

interface MatchesState {
  matches: ApiMatch[];
  conversations: ApiMatch[]; // non-matched direct conversations
  total: number;
  isLoading: boolean;
  hasFetchedOnce: boolean; // tracks if initial fetch completed
  error: string | null;
  pendingLikesCount: number;
  currentUserId: string | null;
  // Firebase real-time unsubscribers
  _firebaseUnsub: (() => void) | null;
  _lastMessageUnsubs: Map<string, () => void>;
  _convFetchDebounceTimer: ReturnType<typeof setTimeout> | null;
}

interface MatchesActions {
  fetchMatches: () => Promise<void>;
  fetchConversations: (currentUserId?: string | null) => Promise<void>;
  fetchPendingLikes: () => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
  pinMatch: (matchId: string) => Promise<void>;
  unpinMatch: (matchId: string) => Promise<void>;
  updateLastMessage: (
    matchId: string,
    message: { content: string; sent_at: string; is_from_me: boolean }
  ) => void;
  startFirebaseListener: (userId: string) => void;
  stopFirebaseListener: () => void;
  subscribeToLastMessages: (conversationIds: string[]) => void;
}

export const useMatchesStore = create<MatchesState & MatchesActions>()(
  (set, get) => ({
    matches: [],
    conversations: [],
    total: 0,
    isLoading: false,
    hasFetchedOnce: false,
    error: null,
    pendingLikesCount: 0,
    currentUserId: null,
    _firebaseUnsub: null,
    _lastMessageUnsubs: new Map(),
    _convFetchDebounceTimer: null,

    fetchMatches: async () => {
      const { hasFetchedOnce } = get();
      // Only show loading skeleton on very first fetch (no data yet)
      // Subsequent fetches update silently (matching app's MatchesContext pattern)
      if (!hasFetchedOnce) {
        set({ isLoading: true, error: null });
      }
      try {
        const response = await apiGet<MatchesResponse>(
          ENDPOINTS.INTERACTIONS.MATCHES
        );
        set({
          matches: response.data.matches,
          total: response.data.total,
          isLoading: false,
          hasFetchedOnce: true,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to load matches",
          isLoading: false,
        });
      }
    },

    fetchConversations: async (currentUserId = null) => {
      if (currentUserId) set({ currentUserId });
      try {
        const response = await apiGet<ConversationsResponse>(
          ENDPOINTS.CONVERSATIONS.LIST
        );
        if (response.data?.conversations) {
          const uid = currentUserId || get().currentUserId;
          const nonMatched = response.data.conversations
            .filter((c) => !c.is_matched)
            .map((c) => conversationToMatch(c, uid));
          set({ conversations: nonMatched });
          console.log(
            "[matches.store] Non-matched conversations:",
            nonMatched.length
          );
        }
      } catch (error) {
        console.error("[matches.store] Error fetching conversations:", error);
      }
    },

    fetchPendingLikes: async () => {
      try {
        const response = await apiGet<PendingLikesResponse>(
          ENDPOINTS.INTERACTIONS.PENDING_LIKES
        );
        set({ pendingLikesCount: response.data?.count ?? 0 });
      } catch {
        // Non-critical, don't set error
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
      await post(ENDPOINTS.INTERACTIONS.PIN_MATCH(matchId));
      set((state) => ({
        matches: state.matches.map((m) =>
          m.match_id === matchId ? { ...m, is_pinned: true } : m
        ),
      }));
    },

    unpinMatch: async (matchId) => {
      await del(ENDPOINTS.INTERACTIONS.UNPIN_MATCH(matchId));
      set((state) => ({
        matches: state.matches.map((m) =>
          m.match_id === matchId ? { ...m, is_pinned: false } : m
        ),
      }));
    },

    updateLastMessage: (matchId, message) => {
      set((state) => {
        const updateFn = (m: ApiMatch) =>
          m.match_id === matchId || m.conversation_id === matchId
            ? {
                ...m,
                last_message: { message_id: "", ...message },
                unread_count: message.is_from_me
                  ? m.unread_count
                  : m.unread_count + 1,
              }
            : m;

        return {
          matches: state.matches.map(updateFn),
          conversations: state.conversations.map(updateFn),
        };
      });
    },

    // Firebase real-time: detect new conversations appearing in user_conversations/{userId}
    // Matches the app's MatchesContext pattern with 400ms debounce
    // Waits for Firebase auth to complete before subscribing.
    startFirebaseListener: (userId: string) => {
      set({ currentUserId: userId });
      const { _firebaseUnsub } = get();
      if (_firebaseUnsub) return; // Already listening

      const { database } = initializeFirebase();
      if (!database) {
        console.warn("[matches.store] Firebase not configured, skipping real-time listener");
        return;
      }

      // Wait for Firebase auth before subscribing (RTDB security rules require it)
      waitForFirebaseAuth().then(() => {
        // Re-check after await (another call may have started the listener)
        if (get()._firebaseUnsub) return;

        try {
          const unsub = subscribeToUserConversations(
            userId,
            (_convId, _otherUserId) => {
              const state = get();
              if (state._convFetchDebounceTimer) {
                clearTimeout(state._convFetchDebounceTimer);
              }
              const timer = setTimeout(() => {
                get().fetchConversations(userId);
                get().fetchMatches();
              }, 400);
              set({ _convFetchDebounceTimer: timer });
            }
          );
          set({ _firebaseUnsub: unsub });
          console.log("[matches.store] Firebase user_conversations listener started");
        } catch {
          console.warn("[matches.store] Firebase listener unavailable");
        }
      }).catch(() => {});
    },

    stopFirebaseListener: () => {
      const { _firebaseUnsub, _convFetchDebounceTimer, _lastMessageUnsubs } =
        get();
      if (_firebaseUnsub) _firebaseUnsub();
      if (_convFetchDebounceTimer) clearTimeout(_convFetchDebounceTimer);
      _lastMessageUnsubs.forEach((unsub) => unsub());
      set({
        _firebaseUnsub: null,
        _convFetchDebounceTimer: null,
        _lastMessageUnsubs: new Map(),
      });
    },

    // Subscribe to last_message previews for conversations (for real-time list updates)
    // Waits for Firebase auth before subscribing.
    subscribeToLastMessages: (conversationIds: string[]) => {
      const { database } = initializeFirebase();
      if (!database) return; // Firebase not configured

      // Wait for Firebase auth before subscribing (RTDB security rules require it)
      waitForFirebaseAuth().then(() => {
        const { _lastMessageUnsubs } = get();
        const newUnsubs = new Map(_lastMessageUnsubs);

        for (const convId of conversationIds) {
          if (newUnsubs.has(convId)) continue;

          try {
            const unsub = subscribeToLastMessage(
              convId,
              (lastMsg: FirebaseLastMessage | null) => {
                if (!lastMsg) return;
                const state = get();
                const uid = state.currentUserId;
                const updateItem = (items: ApiMatch[]) =>
                  items.map((m) =>
                    m.conversation_id === convId
                      ? {
                          ...m,
                          last_message: {
                            message_id: "",
                            content: lastMsg.content,
                            sent_at: new Date(lastMsg.sent_at).toISOString(),
                            is_from_me: lastMsg.sender_id === uid,
                          },
                        }
                      : m
                  );
                set({
                  matches: updateItem(state.matches),
                  conversations: updateItem(state.conversations),
                });
              }
            );
            newUnsubs.set(convId, unsub);
          } catch {
            // Firebase subscription failed
          }
        }

        set({ _lastMessageUnsubs: newUnsubs });
      }).catch(() => {});
    },
  })
);
