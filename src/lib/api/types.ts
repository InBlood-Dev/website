// =============================================
// Core Types
// =============================================

export interface User {
  id: string;
  name: string;
  age: number;
  gender: "Man" | "Woman" | "Non-Binary" | "Other";
  interestedIn: ("Man" | "Woman" | "Non-Binary" | "everyone")[];
  photos: string[];
  bio: string;
  interests: string[];
  prompts?: Array<{ question: string; answer: string }>;
  openingMoves?: Array<{ question: string; answer: string }>;
  pronouns?: string;
  orientation?: string;
  languages?: string[];
  tags?: string[];
  relationshipTypes?: ApiRelationshipType[];
  stats?: { seductions?: number; likes?: number };
  location: { city: string; distance?: number };
  preferences: { ageRange: { min: number; max: number }; maxDistance: number };
  photoMeta?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    orderIndex: number;
  }>;
  verified: boolean;
  lastActive?: Date;
  settings?: {
    isDiscoverable: boolean;
    showDistance: "exact" | "approximate" | "hide";
    showLastActive: boolean;
  };
}

export interface Profile extends User {
  matchPercentage?: number;
}

export interface Match {
  id: string;
  conversationId?: string;
  matchedAt: Date;
  isActive?: boolean;
  profile: Profile;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
}

export interface MatchToastData {
  name: string;
  photo: string;
  matchId: string;
  conversationId: string;
  profile: Profile;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "seen" | "failed";
  type: "text" | "image" | "gif" | "video" | "audio" | "opening_move";
  imageUrl?: string;
  mediaUrl?: string;
  isDeleted?: boolean;
  openingMoveQuestion?: string;
  openingMoveAnswer?: string;
}

export type SwipeDirection = "left" | "right" | "up";

export interface SwipeAction {
  direction: SwipeDirection;
  profile: Profile;
}

// =============================================
// API Response Types
// =============================================

export interface Story {
  story_id: string;
  media_url: string;
  thumbnail_url?: string;
  media_type: "photo" | "video";
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  has_viewed: boolean;
}

export interface StoryUser {
  user_id: string;
  user_name: string;
  user_photo: string;
  is_verified?: boolean;
  stories: Story[];
  has_unviewed: boolean;
}

export interface StoryFeedResponse {
  stories: StoryUser[];
}

export interface ApiPhoto {
  _id: string;
  url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  order_index: number;
}

export interface ApiTag {
  tag_id: string;
  name: string;
  category: string;
}

export interface ApiRelationshipType {
  type: string;
  border_color: string;
}

export interface RecommendedUser {
  user_id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  distance: number;
  location_city: string;
  is_verified: boolean;
  is_online: boolean;
  last_active_at: string;
  match_score: number;
  seductions_count: number;
  hearts_count: number;
  primary_photo: string;
  photos: string[];
  tags: { name: string; category?: string }[];
  relationship_types: ApiRelationshipType[];
  sexual_orientation?: string;
  pronouns?: string;
}

export interface DiscoveryFeedResponse {
  users: RecommendedUser[];
  total: number;
}

export interface ExploreFeedResponse {
  profiles: Array<{
    user_id: string;
    name: string;
    age: number;
    distance?: number;
    primary_photo: string;
    is_online?: boolean;
    last_active_at?: string;
    relationship_types: Array<{ type: string; border_color: string }>;
  }>;
  has_more: boolean;
}

export interface NearbyActiveUser {
  user_id: string;
  name: string;
  age: number;
  distance: number;
  primary_photo: string;
  is_online: boolean;
  is_verified?: boolean;
  sexual_orientation?: string;
  pronouns?: string;
  last_active_at?: string;
}

export interface LikeResponse {
  like: {
    like_id: string;
    liker_user_id: string;
    liked_user_id: string;
    created_at: string;
  };
  is_matched: boolean;
  is_mutual: boolean;
  match?: {
    match_id: string;
    conversation_id: string;
    user1_id: string;
    user2_id: string;
    matched_at: string;
    is_active: boolean;
  };
  swipes_remaining: number | null;
  daily_swipe_limit: number | null;
  is_premium: boolean;
}

export interface SuperLikeResponse {
  super_like: {
    super_like_id: string;
    liker_user_id: string;
    liked_user_id: string;
    is_seen: boolean;
    created_at: string;
  };
  like: {
    like_id: string;
    liker_user_id: string;
    liked_user_id: string;
    created_at: string;
  };
  super_likes_remaining: number;
  daily_limit: number;
  is_premium: boolean;
  is_matched: boolean;
  match?: {
    match_id: string;
    conversation_id: string;
    user1_id: string;
    user2_id: string;
    matched_at: string;
    is_active: boolean;
  };
  swipes_remaining: number | null;
  daily_swipe_limit: number | null;
}

export interface PassResponse {
  pass: {
    pass_id: string;
    passer_user_id: string;
    passed_user_id: string;
    expires_at: string;
    created_at: string;
  };
  swipes_remaining: number | null;
  daily_swipe_limit: number | null;
  is_premium: boolean;
}

export interface DailyLimitsResponse {
  is_premium: boolean;
  swipes: { remaining: number | null; daily_limit: number | null };
  super_likes: { remaining: number; daily_limit: number };
}

export interface ApiMatch {
  match_id: string;
  conversation_id: string;
  user: {
    user_id: string;
    name: string;
    age: number;
    primary_photo: string;
    is_verified: boolean;
    is_online: boolean;
    last_active_at?: string;
  };
  matched_at: string;
  is_active: boolean;
  is_pinned: boolean;
  last_message?: {
    message_id: string;
    content: string;
    sent_at: string;
    is_from_me: boolean;
  };
  unread_count: number;
}

export interface MatchesResponse {
  matches: ApiMatch[];
  total: number;
}

export interface PendingLikesResponse {
  likes: Array<{
    like_id: string;
    user: {
      user_id: string;
      name: string;
      age: number;
      primary_photo: string;
      is_verified: boolean;
    };
    created_at: string;
    is_super_like: boolean;
  }>;
  count: number;
}

export interface ProfileViewRequest {
  viewed_user_id: string;
  source: "discovery" | "explore" | "messages" | "profile" | "story";
}

export interface SearchUser {
  user_id: string;
  name: string;
  age: number;
  primary_photo: string;
  is_verified: boolean;
  distance?: number;
  location_city?: string;
}

export interface SearchResponse {
  users: SearchUser[];
  total: number;
}

// =============================================
// Profile API Types
// =============================================

export interface ApiPrompt {
  prompt_id: string;
  question: string;
  answer: string;
  order_index: number;
}

export interface ApiUserProfile {
  user_id?: string;
  _id?: string;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  primary_photo?: string | null;
  photos?: ApiPhoto[];
  interests?: string[];
  tags?: ApiTag[];
  prompts?: ApiPrompt[];
  opening_moves?: ApiPrompt[];
  pronouns?: string | null;
  sexual_orientation?: string | null;
  languages?: string[];
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  preference_age_min?: number;
  age_min?: number;
  preference_age_max?: number;
  age_max?: number;
  preference_max_distance?: number;
  proximity_range?: number;
  interested_in?: string[];
  is_verified?: boolean;
  is_online?: boolean;
  last_active_at?: string;
  created_at?: string;
  likes_count?: number;
  matches_count?: number;
  super_likes_received?: number;
  seductions_count?: number;
  hearts_count?: number;
  is_premium?: boolean;
  premium_tier?: "normal" | "premium" | "premium_plus";
  premium_expires_at?: string | null;
}

export interface ProfileResponse {
  user: ApiUserProfile;
}

export interface PhotoUploadResponse {
  photo_id: string;
  url: string;
  is_primary: boolean;
  order_index: number;
}

export interface TagsResponse {
  tags: ApiTag[];
  categories?: Array<{ category: string; tags: ApiTag[] }>;
}

export interface UpdatePreferencesResponse {
  preference_age_min: number;
  preference_age_max: number;
  preference_max_distance: number;
  interested_in: string[];
}

// =============================================
// Payment & Subscription Types
// =============================================

export type PlanType = "monthly" | "annual";

export interface SubscriptionPlan {
  _id: string;
  plan_key: PlanType;
  name: string;
  price: number;
  original_price: number | null;
  currency: string;
  duration_days: number;
  period_label: string;
  badge: string | null;
  badge_color: string | null;
  discount_label: string | null;
  features: Array<{ text: string; included: boolean }>;
  is_active: boolean;
  sort_order: number;
}

export interface CreateOrderResponse {
  order_id: string;
  cf_order_id: string;
  payment_session_id: string;
  amount: number;
  currency: string;
  subscription_id: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  status: "created" | "success" | "failed" | "dropped";
  cashfree_status?: string;
  subscription_id: string | null;
}

export interface SubscriptionStatusResponse {
  is_premium: boolean;
  subscription: {
    subscription_id: string;
    plan_type: PlanType;
    status: string;
    started_at: string;
    expires_at: string;
  } | null;
}

export interface VerificationStatusResponse {
  verification_id: string | null;
  status: "none" | "pending" | "approved" | "rejected";
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}
