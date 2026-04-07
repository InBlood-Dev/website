import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken, setOnUnauthorized, setOnTokenRefreshed } from "@/lib/api/client";
import { initializeFirebaseAuth, clearFirebaseAuth } from "@/lib/firebase/auth";
import { API_BASE_URL } from "@/lib/api/endpoints";
import { posthog } from "@/lib/analytics/posthog";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedProfileSetup: boolean;
  userId: string | null;
  accessToken: string | null;
  email: string | null;
  name: string | null;
  profilePicture: string | null;
}

interface AuthActions {
  googleLogin: (googleAccessToken: string, location?: { latitude: number; longitude: number }) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  completeProfileSetup: (data?: { name?: string; profilePicture?: string }) => void;
  restoreSession: () => Promise<void>;
  _initUnauthorizedHandler: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: true,
      hasCompletedOnboarding: false,
      hasCompletedProfileSetup: false,
      userId: null,
      accessToken: null,
      email: null,
      name: null,
      profilePicture: null,

      _initUnauthorizedHandler: () => {
        setOnUnauthorized(() => {
          get().logout();
        });
        setOnTokenRefreshed((newToken) => {
          set({ accessToken: newToken });
        });
      },

      restoreSession: async () => {
        // Wait for zustand persist hydration before reading state
        await new Promise<void>((resolve) => {
          const unsub = useAuthStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
          // If already hydrated, resolve immediately
          if (useAuthStore.persist.hasHydrated()) resolve();
        });

        const { accessToken, userId } = get();
        console.log("[Auth] restoreSession — token:", accessToken ? "found" : "missing", "userId:", userId);
        if (accessToken && userId) {
          setAuthToken(accessToken);
          set({ isAuthenticated: true, isLoading: false });
          initializeFirebaseAuth().catch(() => {});
        } else {
          set({ isLoading: false });
        }
      },

      googleLogin: async (googleAccessToken, location) => {
        set({ isLoading: true });
        try {
          const requestBody: Record<string, unknown> = {
            access_token: googleAccessToken,
          };
          if (location) {
            requestBody.latitude = location.latitude;
            requestBody.longitude = location.longitude;
          }

          const response = await fetch(
            `${API_BASE_URL}/auth/google/mobile`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            set({ isLoading: false });
            return false;
          }

          const backendData = await response.json();
          const userData = backendData.data?.user || backendData.user;
          const jwtAccessToken = backendData.data?.accessToken || null;
          const refreshToken = backendData.data?.refreshToken || null;
          const userId = userData?.user_id || userData?._id || null;

          if (!userId || !jwtAccessToken) {
            set({ isLoading: false });
            return false;
          }

          console.log("[Auth] Backend user data:", JSON.stringify(userData, null, 2));

          const hasProfile =
            userData?.profile_complete === true ||
            userData?.is_profile_complete === true ||
            userData?.profileComplete === true ||
            !!(userData?.gender && userData?.bio) ||
            !!(userData?.name && userData?.age && userData?.gender);

          // Sync token to API client
          setAuthToken(jwtAccessToken);

          // Store refresh token in localStorage (not in zustand to avoid exposure)
          if (refreshToken) {
            localStorage.setItem("inblood_refresh_token", refreshToken);
          }

          set({
            isAuthenticated: true,
            isLoading: false,
            userId,
            accessToken: jwtAccessToken,
            email: userData?.email || null,
            name: userData?.name || null,
            profilePicture: userData?.primary_photo || null,
            hasCompletedOnboarding: hasProfile,
            hasCompletedProfileSetup: hasProfile,
          });

          // Initialize Firebase (truly non-blocking — don't await)
          initializeFirebaseAuth().catch(() => {});

          // Track auth event
          const isNewUser = userData?.is_new_user === true;
          posthog?.capture(isNewUser ? "user_signup" : "user_login", { method: "google" });

          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        posthog?.capture("user_logout");
        setAuthToken(null);
        localStorage.removeItem("inblood_refresh_token");

        try {
          await clearFirebaseAuth();
        } catch {
          // continue
        }

        set({
          isAuthenticated: false,
          isLoading: false,
          hasCompletedOnboarding: false,
          hasCompletedProfileSetup: false,
          userId: null,
          accessToken: null,
          email: null,
          name: null,
          profilePicture: null,
        });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      completeProfileSetup: (data) => {
        set((state) => ({
          hasCompletedProfileSetup: true,
          ...(data?.name && { name: data.name }),
          ...(data?.profilePicture && { profilePicture: data.profilePicture }),
        }));
      },
    }),
    {
      name: "inblood-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasCompletedProfileSetup: state.hasCompletedProfileSetup,
        userId: state.userId,
        accessToken: state.accessToken,
        email: state.email,
        name: state.name,
        profilePicture: state.profilePicture,
      }),
    }
  )
);
