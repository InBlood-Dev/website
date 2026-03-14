"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/stores/user.store";
import Header from "@/components/layout/Header";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import {
  Edit,
  Settings,
  BadgeCheck,
  MapPin,
  Heart,
  Crown,
  Camera,
  User,
  HeartHandshake,
  Globe,
  MessageCircle,
  Star,
  Tags,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  X,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile } = useUserStore();
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading || !profile) {
    return (
      <div className="h-full">
        <Header title="My Profile" />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center py-8">
            <Skeleton variant="circular" className="w-28 h-28" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-40 h-6 mx-auto" />
            <Skeleton className="w-24 h-4 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-xl" variant="rectangular" />
            <Skeleton className="h-24 rounded-xl" variant="rectangular" />
          </div>
        </div>
      </div>
    );
  }

  const photos = (profile.photos || []).map((p) => (typeof p === "string" ? p : p.url));
  const primaryPhoto = profile.primary_photo || photos[0];

  return (
    <div className="h-full flex flex-col">
      <Header title="My Profile">
        <div className="flex gap-1">
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-full hover:bg-white/[0.06] text-white/30 hover:text-white transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => router.push("/profile/edit")}
            className="p-2 rounded-full hover:bg-white/[0.06] text-white/30 hover:text-white transition-colors"
          >
            <Edit className="w-[18px] h-[18px]" />
          </button>
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
        {/* Stats Section with Capsule Shape (matching mobile app) */}
        <div className="relative px-6 pt-8 pb-4">
          {/* Capsule container */}
          <div className="relative flex items-center justify-center max-w-md mx-auto" style={{ height: 140 }}>
            {/* Left ellipse glow (orange/amber) */}
            <div
              className="absolute rounded-full opacity-60 left-[8%]"
              style={{
                width: 90,
                height: 70,
                backgroundColor: '#FFD54F',
                boxShadow: '0 0 60px 30px rgba(255,152,0,0.4)',
                filter: 'blur(20px)',
              }}
            />

            {/* Right ellipse glow (red) */}
            <div
              className="absolute rounded-full opacity-60 right-[8%]"
              style={{
                width: 90,
                height: 70,
                backgroundColor: '#D32F2F',
                boxShadow: '0 0 60px 30px rgba(211,47,47,0.4)',
                filter: 'blur(20px)',
              }}
            />

            {/* Capsule background rectangle */}
            <div
              className="absolute border border-white/10"
              style={{
                width: '100%',
                height: 90,
                borderRadius: 45,
                backgroundColor: '#0D0D0D',
              }}
            />

            {/* Stats content layer */}
            <div className="relative flex items-center justify-between w-full px-8 z-[1]">
              {/* Left stat - Seductions */}
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white">{profile.seductions_count || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mt-1">Seductions</p>
              </div>

              {/* Spacer for profile image */}
              <div style={{ width: 100 }} />

              {/* Right stat - Likes */}
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white">{profile.likes_count || profile.hearts_count || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mt-1">Likes</p>
              </div>
            </div>

            {/* Center profile photo (overlapping capsule) */}
            <button
              onClick={() => {
                if (photos.length > 0) {
                  setPhotoViewerIndex(0);
                  setPhotoViewerOpen(true);
                }
              }}
              className="absolute z-10"
            >
              <div className="w-[116px] h-[116px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF0000', boxShadow: '0 0 15px rgba(255,0,0,0.5)' }}>
                <div className="w-[110px] h-[110px] rounded-full overflow-hidden bg-background">
                  {primaryPhoto ? (
                    <Image
                      src={primaryPhoto}
                      alt={profile.name}
                      width={110}
                      height={110}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
                      <Camera className="w-8 h-8 text-white/15" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Name & details */}
          <div className="text-center mt-3">
            <div className="flex items-center justify-center gap-1">
              <h2 className="text-[28px] font-bold text-white tracking-tight">
                {profile.name}
              </h2>
              <span className="text-[26px] font-medium text-white">, {profile.age}</span>
              {profile.is_verified && (
                <BadgeCheck className="w-6 h-6 text-[#1DA1F2] ml-1" />
              )}
            </div>
            {profile.gender && (
              <p className="text-white/30 text-sm mt-0.5">
                {profile.gender}
                {profile.pronouns && ` · ${profile.pronouns}`}
              </p>
            )}
            <div className="flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-white/40 text-sm">{profile.location_city || "Unknown"}</p>
            </div>
            {(profile.matches_count !== undefined && profile.matches_count > 0) && (
              <div className="inline-flex items-center gap-1.5 mt-2 bg-white px-4 py-1 rounded-full">
                <User className="w-4 h-4 text-black" />
                <span className="text-sm font-medium text-black">{profile.matches_count} Matches</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Bento Grid */}
        <div className="px-6 py-5 space-y-3">
          {/* Bio */}
          {profile.bio && (
            <BentoCard icon={<User className="w-4 h-4" />} title="About Me">
              <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
            </BentoCard>
          )}

          {/* Two column: Pronouns + Verified */}
          <div className="grid grid-cols-2 gap-3">
            <BentoCard icon={<HeartHandshake className="w-4 h-4" />} title="Pronouns" compact>
              <p className="text-white text-sm font-medium">{profile.pronouns || "Not set"}</p>
            </BentoCard>
            <BentoCard icon={<ShieldCheck className="w-4 h-4" />} title="Status" compact>
              <p className={`text-sm font-medium ${profile.is_verified ? "text-info" : "text-white/40"}`}>
                {profile.is_verified ? "Verified" : "Not verified"}
              </p>
            </BentoCard>
          </div>

          {/* Sexual Orientation */}
          <BentoCard icon={<Heart className="w-4 h-4" />} title="Sexual Orientation">
            {profile.sexual_orientation ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 border border-primary/30 rounded-full text-sm text-primary">
                <Heart className="w-3.5 h-3.5" />
                {profile.sexual_orientation}
              </span>
            ) : (
              <button
                onClick={() => router.push("/profile/edit")}
                className="inline-flex items-center gap-1.5 text-white/30 text-sm hover:text-primary transition-colors"
              >
                <span className="w-5 h-5 rounded-full border border-dashed border-white/20 flex items-center justify-center">+</span>
                Add your orientation
              </button>
            )}
          </BentoCard>

          {/* Tags */}
          {profile.tags && profile.tags.length > 0 && (
            <BentoCard icon={<Tags className="w-4 h-4" />} title="Tags">
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, i) => (
                  <Chip
                    key={typeof tag === "string" ? i : tag.tag_id}
                    label={typeof tag === "string" ? tag : tag.name}
                    size="sm"
                  />
                ))}
              </div>
            </BentoCard>
          )}

          {/* Prompts */}
          {profile.prompts && profile.prompts.length > 0 && (
            <BentoCard icon={<MessageCircle className="w-4 h-4" />} title="My Prompts">
              <div className="space-y-3">
                {profile.prompts.map((prompt, i) => (
                  <div key={prompt.prompt_id || i}>
                    <p className="text-white/35 text-xs font-medium mb-1">{prompt.question}</p>
                    <p className="text-white text-sm leading-relaxed">{prompt.answer}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          )}

          {/* Opening Moves */}
          {profile.opening_moves && profile.opening_moves.length > 0 && (
            <BentoCard icon={<Star className="w-4 h-4" />} title="Opening Moves">
              <div className="space-y-3">
                {profile.opening_moves.map((move, i) => (
                  <div key={move.prompt_id || i}>
                    <p className="text-white/35 text-xs font-medium mb-1">{move.question}</p>
                    <p className="text-white text-sm leading-relaxed">{move.answer}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <BentoCard icon={<Globe className="w-4 h-4" />} title="Languages">
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-white/[0.06] rounded-full text-xs text-white/50"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </BentoCard>
          )}

          {/* Photos grid */}
          {photos.length > 0 && (
            <BentoCard icon={<Camera className="w-4 h-4" />} title={`My Photos (${photos.length})`}>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPhotoViewerIndex(i);
                      setPhotoViewerOpen(true);
                    }}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group"
                  >
                    <Image
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  </button>
                ))}
              </div>
            </BentoCard>
          )}

          {/* Premium Card */}
          {profile.is_premium ? (
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-superlike" />
                <span className="text-superlike font-medium text-sm capitalize">
                  {profile.premium_tier || "Premium"}
                </span>
                <span className="px-2 py-0.5 bg-success/15 rounded-full text-[10px] text-success font-semibold uppercase">
                  Active
                </span>
              </div>
              {profile.premium_expires_at && (
                <p className="text-white/30 text-xs">
                  Expires: {new Date(profile.premium_expires_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/premium")}
              className="w-full rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5 flex items-center gap-4 hover:from-primary/25 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Upgrade to Premium</p>
                <p className="text-white/30 text-xs mt-0.5">Unlimited likes, see who liked you & more</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary/50" />
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction icon={<ShieldCheck className="w-5 h-5" />} label="Safety" onClick={() => {}} />
            <QuickAction icon={<HelpCircle className="w-5 h-5" />} label="Help" onClick={() => {}} />
            <QuickAction icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => router.push("/settings")} />
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="px-6 py-4">
          <button
            onClick={() => router.push("/profile/edit")}
            className="w-full py-3.5 bg-white/[0.04] hover:bg-white/[0.06] text-white/50 hover:text-white transition-all text-sm rounded-full tracking-wide border border-white/[0.06] hover:border-white/[0.1]"
          >
            Edit Profile
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-white/10">InBlood v1.0.0</p>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {photoViewerOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col">
          {/* Close */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setPhotoViewerOpen(false)} className="p-2 rounded-full hover:bg-white/[0.1]">
              <X className="w-6 h-6 text-white" />
            </button>
            <span className="text-white/50 text-sm">{photoViewerIndex + 1} / {photos.length}</span>
            <div className="w-10" />
          </div>
          {/* Photo */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            <Image
              src={photos[photoViewerIndex]}
              alt={`Photo ${photoViewerIndex + 1}`}
              width={800}
              height={1000}
              className="max-w-full max-h-full object-contain rounded-xl"
              unoptimized
            />
            {/* Nav buttons */}
            {photoViewerIndex > 0 && (
              <button
                onClick={() => setPhotoViewerIndex((i) => i - 1)}
                className="absolute left-4 p-3 rounded-full bg-white/[0.1] hover:bg-white/[0.2] transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {photoViewerIndex < photos.length - 1 && (
              <button
                onClick={() => setPhotoViewerIndex((i) => i + 1)}
                className="absolute right-4 p-3 rounded-full bg-white/[0.1] hover:bg-white/[0.2] transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
          {/* Indicators */}
          <div className="flex items-center justify-center gap-2 py-4">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoViewerIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === photoViewerIndex ? "bg-white" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────────────────────

function BentoCard({
  icon,
  title,
  children,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`bg-white/[0.03] rounded-xl border border-white/[0.06] ${compact ? "p-3.5" : "p-4"}`}>
      <div className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-3"}`}>
        <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center text-white">
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-[0.15em] text-white/30">{title}</span>
      </div>
      {children}
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-4 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
        {icon}
      </div>
      <span className="text-xs text-white/40">{label}</span>
    </button>
  );
}
