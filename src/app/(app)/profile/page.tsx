"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/stores/user.store";
import Header from "@/components/layout/Header";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import {
  Edit,
  Settings,
  BadgeCheck,
  MapPin,
  Heart,
  Flame,
  Crown,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading || !profile) {
    return (
      <div className="h-full">
        <Header title="Profile" />
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="w-24 h-24" />
            <div className="space-y-2">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
          <Skeleton className="w-full h-20" variant="rectangular" />
        </div>
      </div>
    );
  }

  const userId = profile.user_id || profile._id;
  const photos = profile.photos || [];
  const primaryPhoto = profile.primary_photo || photos[0]?.url;

  return (
    <div className="h-full flex flex-col">
      <Header title="Profile">
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/profile/edit")}
            className="p-2 rounded-lg hover:bg-card-light text-text-muted hover:text-white transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-lg hover:bg-card-light text-text-muted hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="relative px-6 pt-6">
          <div className="flex items-start gap-5">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-card shrink-0">
              {primaryPhoto ? (
                <Image
                  src={primaryPhoto}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-text-muted" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  {profile.name}, {profile.age}
                </h2>
                {profile.is_verified && (
                  <BadgeCheck className="w-5 h-5 text-info fill-info/20" />
                )}
              </div>

              {profile.location_city && (
                <p className="text-text-secondary text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location_city}
                  {profile.location_state && `, ${profile.location_state}`}
                </p>
              )}

              {profile.pronouns && (
                <p className="text-text-muted text-sm mt-1">
                  {profile.pronouns}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-white font-medium">
                    {profile.hearts_count || 0}
                  </span>
                  <span className="text-text-muted">hearts</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="text-white font-medium">
                    {profile.seductions_count || 0}
                  </span>
                  <span className="text-text-muted">seductions</span>
                </div>
              </div>

              {profile.is_premium && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Crown className="w-4 h-4 text-superlike" />
                  <span className="text-superlike text-sm font-medium capitalize">
                    {profile.premium_tier || "Premium"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              About
            </h3>
            <p className="text-white text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Photos grid */}
        {photos.length > 0 && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div
                  key={photo._id}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card-light"
                >
                  <Image
                    src={photo.url}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  {photo.is_primary && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary px-2 py-0.5 rounded-full text-white">
                      PRIMARY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {profile.tags && profile.tags.length > 0 && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <Chip key={tag.tag_id} label={tag.name} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Prompts
            </h3>
            <div className="space-y-3">
              {profile.prompts.map((prompt) => (
                <div
                  key={prompt.prompt_id}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <p className="text-text-secondary text-xs font-medium mb-1">
                    {prompt.question}
                  </p>
                  <p className="text-white text-sm">{prompt.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-6">
          <Button
            onClick={() => router.push("/profile/edit")}
            variant="secondary"
            fullWidth
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
