"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/stores/user.store";
import { useUIStore } from "@/stores/ui.store";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Chip from "@/components/ui/Chip";
import Slider from "@/components/ui/Slider";
import { ArrowLeft, Plus, X, GripVertical, Trash2 } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, fetchProfile, updateProfile, uploadPhoto, deletePhoto, setPrimaryPhoto } = useUserStore();
  const addToast = useUIStore((s) => s.addToast);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [orientation, setOrientation] = useState("");

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setPronouns(profile.pronouns || "");
      setOrientation(profile.sexual_orientation || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        pronouns: pronouns.trim() || null,
        sexual_orientation: orientation.trim() || null,
      });
      addToast({ message: "Profile updated!", type: "success" });
      router.push("/profile");
    } catch {
      addToast({ message: "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto(file);
      await fetchProfile();
      addToast({ message: "Photo uploaded!", type: "success" });
    } catch {
      addToast({ message: "Failed to upload photo", type: "error" });
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(photoId);
      await fetchProfile();
      addToast({ message: "Photo deleted", type: "info" });
    } catch {
      addToast({ message: "Failed to delete photo", type: "error" });
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await setPrimaryPhoto(photoId);
      await fetchProfile();
      addToast({ message: "Primary photo updated", type: "success" });
    } catch {
      addToast({ message: "Failed to set primary photo", type: "error" });
    }
  };

  if (!profile) return null;

  const photos = profile.photos || [];

  return (
    <div className="h-full flex flex-col">
      <Header title="Edit Profile">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-1.5 bg-primary text-white text-sm rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Photos */}
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">
            Photos
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.04] group border border-white/[0.06]"
              >
                <Image
                  src={photo.url}
                  alt="Photo"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!photo.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(photo._id)}
                      className="px-3 py-1.5 bg-primary rounded-full text-white text-xs font-medium"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="p-2 bg-error/90 rounded-full text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {photo.is_primary && (
                  <span className="absolute top-2 left-2 text-[10px] font-medium bg-primary px-2 py-0.5 rounded-full text-white uppercase tracking-wider">
                    Primary
                  </span>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/[0.1] hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
                <Plus className="w-7 h-7 text-white/20 mb-1" />
                <span className="text-xs text-white/25">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic info */}
        <div className="space-y-5">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-white/25 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
            <p className="text-right text-xs text-white/20 mt-1">
              {bio.length}/500
            </p>
          </div>
          <Input
            label="Pronouns"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g. he/him"
          />
          <Input
            label="Sexual Orientation"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            placeholder="e.g. Straight, Bisexual"
          />
        </div>
      </div>
    </div>
  );
}
