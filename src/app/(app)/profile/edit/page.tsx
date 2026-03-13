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
        <Button onClick={handleSave} size="sm" isLoading={isSaving}>
          Save
        </Button>
      </Header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Photos */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Photos
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card group"
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
                      className="px-2 py-1 bg-primary rounded text-white text-xs font-medium"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="p-1.5 bg-error rounded text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {photo.is_primary && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary px-2 py-0.5 rounded-full text-white">
                    PRIMARY
                  </span>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors bg-card/50">
                <Plus className="w-8 h-8 text-text-muted mb-1" />
                <span className="text-xs text-text-muted">Add Photo</span>
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
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
            <p className="text-right text-xs text-text-muted mt-1">
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
