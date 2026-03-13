export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://backend-cfh1.onrender.com/api/v1";

export const API_TIMEOUT = 30000;

export const ENDPOINTS = {
  AUTH: {
    GOOGLE_MOBILE: "/auth/google/mobile",
    REFRESH_TOKEN: "/auth/refresh-token",
    FIREBASE_TOKEN: "/auth/firebase-token",
  },
  USERS: {
    PROFILE: "/users/profile",
    BY_ID: (userId: string) => `/users/${userId}`,
    LOCATION: "/users/location",
    UPLOAD_PHOTO: "/users/upload-photo",
    DELETE_PHOTO: (photoId: string) => `/users/photos/${photoId}`,
    REPLACE_PHOTO: (photoId: string) => `/users/photos/${photoId}/replace`,
    SET_PRIMARY_PHOTO: (photoId: string) =>
      `/users/photos/${photoId}/set-primary`,
    TAGS: "/users/tags",
    REMOVE_TAG: (tagId: string) => `/users/tags/${tagId}`,
    PREFERENCES: "/users/preferences",
  },
  STORIES: {
    FEED: "/stories/feed",
    CREATE: "/stories",
    MY_STORIES: "/stories/me",
    DELETE: (storyId: string) => `/stories/${storyId}`,
    VIEW: (storyId: string) => `/stories/${storyId}/view`,
    VIEWERS: (storyId: string) => `/stories/${storyId}/viewers`,
  },
  DISCOVERY: {
    FEED: "/discovery/feed",
    EXPLORE: "/explore/feed",
    GALLERY: "/explore/gallery",
  },
  LOCATION: {
    NEARBY_ACTIVE: "/home/nearby-active",
    MAP_NEARBY: "/map/nearby",
  },
  INTERACTIONS: {
    LIKE: "/likes",
    SUPER_LIKE: "/super-likes",
    PASS: "/passes",
    MATCHES: "/matches",
    UNMATCH: (matchId: string) => `/matches/${matchId}`,
    PIN_MATCH: (matchId: string) => `/matches/${matchId}/pin`,
    UNPIN_MATCH: (matchId: string) => `/matches/${matchId}/unpin`,
    PROFILE_VIEW: "/profile-views",
    PENDING_LIKES: "/likes/received",
    DAILY_LIMITS: "/interactions/daily-limits",
  },
  SEARCH: "/search",
  TAGS: "/tags",
  VERIFICATION: {
    REQUEST: "/verification/request",
    STATUS: "/verification/status",
  },
  UPLOAD: {
    SINGLE: "/upload/single",
    MULTIPLE: "/upload/multiple",
  },
  PAYMENTS: {
    PLANS: "/payments/plans",
    CREATE_ORDER: "/payments/create-order",
    STATUS: (orderId: string) => `/payments/status/${orderId}`,
  },
  SUBSCRIPTIONS: {
    STATUS: "/subscriptions/status",
    CANCEL: "/subscriptions/cancel",
  },
  SETTINGS: "/users/settings",
  BLOCKS: {
    LIST: "/blocks",
    BLOCK: "/blocks",
    UNBLOCK: (blockId: string) => `/blocks/${blockId}`,
  },
  NOTIFICATIONS: {
    REGISTER_TOKEN: "/notifications/register-token",
    UNREGISTER_TOKEN: "/notifications/unregister-token",
  },
  CONVERSATIONS: {
    LIST: "/conversations",
    CREATE: "/conversations",
    STATUS: (conversationId: string) =>
      `/conversations/${conversationId}/status`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
