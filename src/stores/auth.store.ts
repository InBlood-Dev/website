import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken, setOnUnauthorized } from "@/lib/api/client";
import { initializeFirebaseAuth, clearFirebaseAuth } from "@/lib/firebase/auth";
import { API_BASE_URL } from "@/lib/api/endpoints";

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
      },

      restoreSession: async () => {
        const { accessToken, userId } = get();
        if (accessToken && userId) {
          setAuthToken(accessToken);
          set({ isAuthenticated: true, isLoading: false });
          try {
            await initializeFirebaseAuth();
          } catch {
            // continue without firebase
          }
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

          const hasProfile =
            userData?.profile_complete === true ||
            (userData?.gender && userData?.bio && userData?.interests?.length > 0);

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
            hasCompletedOnboarding: true,
            hasCompletedProfileSetup: hasProfile,
          });

          // Initialize Firebase (non-blocking)
          try {
            await initializeFirebaseAuth();
          } catch {
            // continue without firebase
          }

          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
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
          userId: null,
          accessToken: null,
          email: null,
          name: null,
          profilePicture: null,
          hasCompletedProfileSetup: false,
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
