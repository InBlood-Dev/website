"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { get as apiGet, post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import type { ApiUserProfile } from "@/lib/api/types";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Heart,
  X,
  Star,
  Flag,
  Ban,
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet<{ user: ApiUserProfile }>(
          ENDPOINTS.USERS.BY_ID(userId)
        );
        setProfile(response.data.user);

        // Track profile view
        post(ENDPOINTS.INTERACTIONS.PROFILE_VIEW, {
          target_user_id: userId,
          source: "profile",
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
      <div className="h-full">
        <Header />
        <div className="p-6">
          <Skeleton className="w-full aspect-[3/4] rounded-2xl" variant="rectangular" />
        </div>
      </div>
    );
  }

  const photos = profile.photos?.map((p) => typeof p === "string" ? p : p.url).filter(Boolean) || [];
  if (profile.primary_photo && !photos.includes(profile.primary_photo)) {
    photos.unshift(profile.primary_photo);
  }
  const currentPhoto = photos[photoIndex] || profile.primary_photo;

  const handleLike = async () => {
    try {
      await post(ENDPOINTS.INTERACTIONS.LIKE, { target_user_id: userId });
      router.back();
    } catch {
      // handle
    }
  };

  const handlePass = async () => {
    try {
      await post(ENDPOINTS.INTERACTIONS.PASS, { target_user_id: userId });
      router.back();
    } catch {
      // handle
    }
  };

  const handleSuperLike = async () => {
    try {
      await post(ENDPOINTS.INTERACTIONS.SUPER_LIKE, { target_user_id: userId });
      router.back();
    } catch {
      // handle
    }
  };

  const handleBlock = async () => {
    try {
      await post(ENDPOINTS.BLOCKS.BLOCK, { blocked_user_id: userId });
      router.back();
    } catch {
      // handle
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-30 md:relative md:top-0 md:left-0">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Photo */}
        <div className="relative w-full aspect-[3/4] max-h-[70vh]">
          {currentPhoto && (
            <Image
              src={currentPhoto}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          )}

          {/* Photo dots */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`flex-1 h-[3px] rounded-full transition-colors ${
                    i === photoIndex ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Nav zones */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setPhotoIndex((prev) => Math.max(prev - 1, 0))
                }
                className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
              />
              <button
                onClick={() =>
                  setPhotoIndex((prev) =>
                    Math.min(prev + 1, photos.length - 1)
                  )
                }
                className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
              />
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Profile info */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-medium text-white tracking-tight">
              {profile.name}, {profile.age}
            </h1>
            {profile.is_verified && (
              <BadgeCheck className="w-6 h-6 text-info fill-info/20" />
            )}
          </div>

          {profile.location_city && (
            <p className="text-white/40 text-sm flex items-center gap-1.5 mb-4">
              <MapPin className="w-4 h-4" />
              {profile.location_city}
            </p>
          )}

          {profile.sexual_orientation && (
            <p className="text-white/25 text-sm mb-2">
              {profile.sexual_orientation}
              {profile.pronouns && ` · ${profile.pronouns}`}
            </p>
          )}

          {profile.bio && (
            <div className="py-4">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-2.5">
                About
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.tags && profile.tags.length > 0 && (
            <div className="py-4">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, i) => (
                  <Chip key={typeof tag === "string" ? i : tag.tag_id} label={typeof tag === "string" ? tag : tag.name} size="sm" />
                ))}
              </div>
            </div>
          )}

          {profile.prompts && profile.prompts.length > 0 && (
            <div className="py-4">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">
                Prompts
              </h3>
              <div className="space-y-3">
                {profile.prompts.map((prompt) => (
                  <div
                    key={prompt.prompt_id}
                    className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]"
                  >
                    <p className="text-white/40 text-xs font-medium mb-1.5">
                      {prompt.question}
                    </p>
                    <p className="text-white text-sm leading-relaxed">{prompt.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spacer for bottom actions */}
        <div className="h-28" />
      </div>

      {/* Action bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={handlePass}
            className="w-14 h-14 rounded-full border border-white/[0.15] flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <X className="w-7 h-7 text-white/50" />
          </button>
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
          >
            <Heart className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={handleSuperLike}
            className="w-14 h-14 rounded-full border border-superlike/30 flex items-center justify-center bg-superlike/5 hover:bg-superlike/15 transition-all"
          >
            <Star className="w-7 h-7 text-superlike" />
          </button>
        </div>
      </div>
    </div>
  );
}
