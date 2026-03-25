"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet, post, ApiError } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Skeleton from "@/components/ui/Skeleton";
import type { ApiUserProfile } from "@/lib/api/types";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils/cn";
import {
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  MapPin,
  Heart,
  X as XIcon,
  Star,
  MessageCircle,
  Camera,
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const addToast = useUIStore((s) => s.addToast);

  // Photo viewer modal state
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet<{ user: ApiUserProfile }>(
          ENDPOINTS.USERS.BY_ID(userId)
        );
        setProfile(response.data.user);

        // Track profile view
        post(ENDPOINTS.INTERACTIONS.PROFILE_VIEW, {
          viewed_user_id: userId,
        }).catch(() => {});
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  if (isLoading || !profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Skeleton variant="circular" className="w-36 h-36 mb-6" />
        <Skeleton className="w-40 h-6 mb-2" />
        <Skeleton className="w-24 h-4" />
      </div>
    );
  }

  const photos =
    profile.photos
      ?.map((p) => (typeof p === "string" ? p : p.url))
      .filter(Boolean) || [];
  if (profile.primary_photo && !photos.includes(profile.primary_photo)) {
    photos.unshift(profile.primary_photo);
  }
  const primaryPhoto = photos[0] || profile.primary_photo;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags = (profile as any).tags || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prompts = (profile as any).prompts || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interests = (profile as any).interests || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relationshipTypes = (profile as any).relationship_types || [];

  const handleLike = async () => {
    try {
      const res = await post<{
        is_matched?: boolean;
        match?: { conversation_id: string };
      }>(ENDPOINTS.INTERACTIONS.LIKE, { target_user_id: userId });
      if (res.data?.is_matched && res.data?.match) {
        addToast({
          type: "success",
          message: `It's a match with ${profile.name}!`,
        });
        router.push(`/chat/${res.data.match.conversation_id}`);
      } else {
        addToast({ type: "success", message: `You liked ${profile.name}` });
        router.back();
      }
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : err instanceof Error
            ? err.message
            : "Failed to like";
      if (detail.toLowerCase().includes("already")) {
        addToast({
          type: "info",
          message: "You already liked this person",
        });
        router.back();
      } else {
        addToast({ type: "error", message: detail });
      }
    }
  };

  const handlePass = async () => {
    try {
      await post(ENDPOINTS.INTERACTIONS.PASS, { target_user_id: userId });
      router.back();
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : err instanceof Error
            ? err.message
            : "Failed to pass";
      if (detail.toLowerCase().includes("already")) {
        router.back();
      } else {
        addToast({ type: "error", message: detail });
      }
    }
  };

  const handleSuperLike = async () => {
    try {
      const res = await post<{
        is_matched?: boolean;
        match?: { conversation_id: string };
      }>(ENDPOINTS.INTERACTIONS.SUPER_LIKE, { target_user_id: userId });
      if (res.data?.is_matched && res.data?.match) {
        addToast({
          type: "success",
          message: `It's a match with ${profile.name}!`,
        });
        router.push(`/chat/${res.data.match.conversation_id}`);
      } else {
        addToast({
          type: "success",
          message: `You super liked ${profile.name}!`,
        });
        router.back();
      }
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : err instanceof Error
            ? err.message
            : "Failed to super like";
      if (detail.toLowerCase().includes("already")) {
        addToast({
          type: "info",
          message: "You already super liked this person",
        });
        router.back();
      } else {
        addToast({ type: "error", message: detail });
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Close / Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 md:left-6 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* ─── Desktop: Two-column layout ─── */}
        <div className="max-w-5xl mx-auto w-full px-6 pt-16 md:pt-20">
          <div className="md:grid md:grid-cols-[400px_1fr] lg:grid-cols-[440px_1fr] md:gap-10 lg:gap-14">

            {/* ─── Left Column: Photos ─── */}
            <div className="md:sticky md:top-20 md:self-start">
              {/* Main photo */}
              <button
                onClick={() => {
                  if (photos.length > 0) {
                    setPhotoViewerIndex(0);
                    setPhotoViewerOpen(true);
                  }
                }}
                className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.04] relative group mb-3"
              >
                {primaryPhoto ? (
                  <Image
                    src={primaryPhoto}
                    alt={profile.name}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 440px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {photos.length > 1 && (
                  <span className="absolute bottom-3 right-3 text-xs text-white/60 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    1 / {photos.length}
                  </span>
                )}
              </button>

              {/* Photo thumbnails grid */}
              {photos.length > 1 && (
                <div className="grid grid-cols-3 gap-1.5 mb-6 md:mb-0">
                  {photos.slice(1, 7).map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPhotoViewerIndex(index + 1);
                        setPhotoViewerOpen(true);
                      }}
                      className="aspect-square rounded-xl overflow-hidden bg-white/[0.03] relative group"
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${index + 2}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="140px"
                        unoptimized
                      />
                      {index === 5 && photos.length > 7 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">+{photos.length - 7}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Right Column: Info ─── */}
            <div className="md:pt-0">
              {/* Name + basic info */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{profile.name}</h1>
                  <span className="text-2xl md:text-3xl font-semibold text-white/70">
                    {profile.age}
                  </span>
                  {profile.is_verified && (
                    <BadgeCheck className="w-6 h-6 text-primary ml-1" />
                  )}
                </div>

                {(profile as any).pronouns && (
                  <p className="text-sm text-white/25 mb-2">
                    {(profile as any).pronouns}
                  </p>
                )}

                <div className="flex items-center gap-1.5 mb-4">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/40">
                    {profile.location_city || "Unknown"}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(profile as any).distance != null &&
                      (profile as any).distance > 0 &&
                      ` · ${(profile as any).distance} km away`}
                  </span>
                </div>

                {/* Relationship types */}
                {relationshipTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {relationshipTypes.map((rt: any, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-semibold border"
                        style={{
                          borderColor: rt.border_color || "#E53935",
                          color: rt.border_color || "#E53935",
                          backgroundColor: `${rt.border_color || "#E53935"}20`,
                        }}
                      >
                        {rt.type || rt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="flex gap-6 mb-8 py-4 border-y border-white/[0.06]">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(profile as any).seductions_count?.toLocaleString() || "0"}
                  </p>
                  <p className="text-[10px] font-medium text-white/25 tracking-wider uppercase mt-1">
                    Seductions
                  </p>
                </div>
                <div className="w-px bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-xl font-bold text-white">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(profile as any).likes_count || 0}
                  </p>
                  <p className="text-[10px] font-medium text-white/25 tracking-wider uppercase mt-1">
                    Likes
                  </p>
                </div>
              </div>

              {/* ─── Action Buttons (desktop: inline) ─── */}
              <div className="hidden md:flex items-center gap-3 mb-8">
                <button
                  onClick={handleLike}
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                >
                  <Heart className="w-5 h-5" />
                  Like
                </button>
                <button
                  onClick={handleSuperLike}
                  className="h-12 px-5 rounded-full border border-superlike/30 flex items-center justify-center gap-2 bg-superlike/5 hover:bg-superlike/15 transition-all text-superlike text-sm font-semibold"
                >
                  <Star className="w-5 h-5" />
                  Super Like
                </button>
                <button
                  onClick={handlePass}
                  className="h-12 px-5 rounded-full border border-white/[0.12] flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-white/50 text-sm font-semibold"
                >
                  <XIcon className="w-5 h-5" />
                  Pass
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await post<{ conversation_id: string }>(
                        ENDPOINTS.CONVERSATIONS.CREATE,
                        { target_user_id: userId }
                      );
                      if (res.data?.conversation_id) {
                        router.push(`/chat/${res.data.conversation_id}`);
                      }
                    } catch {
                      addToast({
                        type: "error",
                        message: "Could not start conversation",
                      });
                    }
                  }}
                  className="h-12 px-5 rounded-full border border-white/[0.12] flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-white/50 text-sm font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </button>
              </div>

              {/* ─── About Me ─── */}
              {profile.bio && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">
                    About Me
                  </h3>
                  <p className="text-[15px] text-white/60 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* ─── Tags ─── */}
              {tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {tags.map((tag: any, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm font-semibold border border-primary text-primary"
                        style={{ backgroundColor: "rgba(229,57,53,0.12)" }}
                      >
                        {typeof tag === "string" ? tag : tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── The Narrative (Prompts) ─── */}
              {prompts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">
                    The Narrative
                  </h3>
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {prompts.map((prompt: any, i: number) => (
                      <div
                        key={prompt.prompt_id ?? i}
                        className="bg-card rounded-xl p-4 border border-white/[0.06]"
                      >
                        <p className="text-xs font-medium text-white/25 uppercase tracking-wider mb-2">
                          {prompt.question}
                        </p>
                        <p className="text-[15px] font-medium text-white leading-relaxed">
                          {prompt.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Interests ─── */}
              {interests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm text-white/50 bg-white/[0.06]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Sexual Orientation ─── */}
              {profile.sexual_orientation && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">
                    Orientation
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 border border-primary/30 rounded-full text-sm text-primary">
                    <Heart className="w-3.5 h-3.5" />
                    {profile.sexual_orientation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile-only Action Bar (bottom fixed) ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[15] flex items-center justify-center gap-5 py-4 px-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        {/* Pass */}
        <button
          onClick={handlePass}
          className="w-14 h-14 rounded-full border border-white/[0.15] flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] transition-all active:scale-90"
        >
          <XIcon className="w-7 h-7 text-white/50" />
        </button>

        {/* Super Like */}
        <button
          onClick={handleSuperLike}
          className="w-14 h-14 rounded-full border border-superlike/30 flex items-center justify-center bg-superlike/5 hover:bg-superlike/15 transition-all active:scale-90"
        >
          <Star className="w-7 h-7 text-superlike" />
        </button>

        {/* Like (largest) */}
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 active:scale-90"
        >
          <Heart className="w-8 h-8 text-white" />
        </button>

        {/* Chat */}
        <button
          onClick={async () => {
            try {
              const res = await post<{ conversation_id: string }>(
                ENDPOINTS.CONVERSATIONS.CREATE,
                { target_user_id: userId }
              );
              if (res.data?.conversation_id) {
                router.push(`/chat/${res.data.conversation_id}`);
              }
            } catch {
              addToast({
                type: "error",
                message: "Could not start conversation",
              });
            }
          }}
          className="w-14 h-14 rounded-full border border-white/[0.15] flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] transition-all active:scale-90"
        >
          <MessageCircle className="w-7 h-7 text-white/50" />
        </button>
      </div>

      {/* ─── Photo Viewer Modal ─── */}
      {photoViewerOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center">
          {/* Close */}
          <button
            onClick={() => setPhotoViewerOpen(false)}
            className="absolute top-14 right-5 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center z-10 hover:bg-white/20 transition-colors"
          >
            <XIcon className="w-7 h-7 text-white" />
          </button>

          {/* Photo */}
          <div className="relative w-full max-w-2xl px-4" style={{ height: "70vh" }}>
            <Image
              src={photos[photoViewerIndex]}
              alt={`Photo ${photoViewerIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />

            {/* Nav arrows */}
            {photoViewerIndex > 0 && (
              <button
                onClick={() => setPhotoViewerIndex((i) => i - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}
            {photoViewerIndex < photos.length - 1 && (
              <button
                onClick={() => setPhotoViewerIndex((i) => i + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2 mt-6">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoViewerIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === photoViewerIndex
                    ? "w-6 bg-white"
                    : "w-2 bg-white/40"
                )}
              />
            ))}
          </div>

          {/* Counter */}
          <p className="text-white font-semibold mt-3">
            {photoViewerIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  );
}
