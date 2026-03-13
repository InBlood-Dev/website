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
          <Skeleton variant="rectangular" className="w-full aspect-[2/1] rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
      </div>
    );
  }

  const userId = profile.user_id || profile._id;
  const photos = profile.photos || [];
  const primaryPhoto = profile.primary_photo || (typeof photos[0] === "string" ? photos[0] : photos[0]?.url);

  return (
    <div className="h-full flex flex-col">
      <Header title="Profile">
        <div className="flex gap-1">
          <button
            onClick={() => router.push("/profile/edit")}
            className="p-2 rounded-full hover:bg-white/[0.06] text-white/30 hover:text-white transition-colors"
          >
            <Edit className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-full hover:bg-white/[0.06] text-white/30 hover:text-white transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero section with photo */}
        <div className="relative">
          <div className="w-full aspect-[16/9] md:aspect-[2.5/1] relative overflow-hidden">
            {primaryPhoto ? (
              <Image
                src={primaryPhoto}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/15" />
              </div>
            )}
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 className="text-3xl font-medium text-white tracking-tight">
                    {profile.name}, {profile.age}
                  </h2>
                  {profile.is_verified && (
                    <BadgeCheck className="w-6 h-6 text-info fill-info/20" />
                  )}
                </div>

                {profile.location_city && (
                  <p className="text-white/40 text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location_city}
                    {profile.location_state && `, ${profile.location_state}`}
                  </p>
                )}
              </div>

              {profile.is_premium && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-superlike/10 border border-superlike/20">
                  <Crown className="w-4 h-4 text-superlike" />
                  <span className="text-superlike text-xs font-medium capitalize">
                    {profile.premium_tier || "Premium"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-6 py-5 flex gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{profile.hearts_count || 0}</p>
              <p className="text-white/20 text-[11px] uppercase tracking-wider">Hearts</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Image src="/logo.png" alt="InBlood" width={16} height={16} className="rounded-sm" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{profile.seductions_count || 0}</p>
              <p className="text-white/20 text-[11px] uppercase tracking-wider">Seductions</p>
            </div>
          </div>
          {profile.pronouns && (
            <div className="ml-auto flex items-center">
              <span className="text-white/25 text-sm px-3 py-1 rounded-full border border-white/[0.06]">
                {profile.pronouns}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Bio */}
        {profile.bio && (
          <div className="px-6 py-5">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">
              About
            </h3>
            <p className="text-white/70 text-[15px] leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Photos grid */}
        {photos.length > 0 && (
          <div className="px-6 py-4">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">
              Photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => {
                const photoUrl = typeof photo === "string" ? photo : photo.url;
                const photoKey = typeof photo === "string" ? i : photo._id;
                return (
                <div
                  key={photoKey}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group"
                >
                  <Image
                    src={photoUrl}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  {typeof photo !== "string" && photo.is_primary && (
                    <span className="absolute top-2 left-2 text-[10px] font-medium bg-primary px-2 py-0.5 rounded-full text-white uppercase tracking-wider">
                      Primary
                    </span>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {profile.tags && profile.tags.length > 0 && (
          <div className="px-6 py-4">
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

        {/* Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="px-6 py-4">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">
              Prompts
            </h3>
            <div className="space-y-3">
              {profile.prompts.map((prompt) => (
                <div
                  key={prompt.prompt_id}
                  className="rounded-xl p-4 border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent"
                >
                  <p className="text-white/35 text-xs font-medium mb-1.5">
                    {prompt.question}
                  </p>
                  <p className="text-white text-sm leading-relaxed">{prompt.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-6">
          <button
            onClick={() => router.push("/profile/edit")}
            className="w-full py-3.5 bg-white/[0.04] hover:bg-white/[0.06] text-white/50 hover:text-white transition-all text-sm rounded-full tracking-wide border border-white/[0.06] hover:border-white/[0.1]"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
