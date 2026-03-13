import { create } from "zustand";
import { get as apiGet, put, postFormData, del } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiUserProfile,
  ProfileResponse,
  PhotoUploadResponse,
  TagsResponse,
  ApiTag,
  UpdatePreferencesResponse,
} from "@/lib/api/types";

interface UserState {
  profile: ApiUserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ApiUserProfile>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<PhotoUploadResponse>;
  deletePhoto: (photoId: string) => Promise<void>;
  setPrimaryPhoto: (photoId: string) => Promise<void>;
  addTag: (tagId: string) => Promise<void>;
  removeTag: (tagId: string) => Promise<void>;
  updatePreferences: (prefs: {
    age_min?: number;
    age_max?: number;
    max_distance?: number;
    interested_in?: string[];
  }) => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState & UserActions>()((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGet<ProfileResponse>(ENDPOINTS.USERS.PROFILE);
      set({ profile: response.data.user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await put<ProfileResponse>(ENDPOINTS.USERS.PROFILE, data);
      set({ profile: response.data.user });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update" });
      throw error;
    }
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const response = await postFormData<PhotoUploadResponse>(
      ENDPOINTS.USERS.UPLOAD_PHOTO,
      formData
    );
    return response.data;
  },

  deletePhoto: async (photoId) => {
    await del(ENDPOINTS.USERS.DELETE_PHOTO(photoId));
  },

  setPrimaryPhoto: async (photoId) => {
    await put(ENDPOINTS.USERS.SET_PRIMARY_PHOTO(photoId));
  },

  addTag: async (tagId) => {
    await import("@/lib/api/client").then((m) =>
      m.post(ENDPOINTS.USERS.TAGS, { tag_id: tagId })
    );
  },

  removeTag: async (tagId) => {
    await del(ENDPOINTS.USERS.REMOVE_TAG(tagId));
  },

  updatePreferences: async (prefs) => {
    await put<UpdatePreferencesResponse>(ENDPOINTS.USERS.PREFERENCES, prefs);
  },

  updateLocation: async (lat, lng) => {
    await put(ENDPOINTS.USERS.LOCATION, { latitude: lat, longitude: lng });
  },

  clearProfile: () => {
    set({ profile: null, isLoading: false, error: null });
  },
}));
