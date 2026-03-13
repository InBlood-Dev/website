"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { put, postFormData } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { get as apiGet } from "@/lib/api/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Chip from "@/components/ui/Chip";
import Slider from "@/components/ui/Slider";
import ProgressBar from "@/components/ui/ProgressBar";
import { Camera, Plus, X, ArrowLeft, ArrowRight } from "lucide-react";
import type { ApiTag, TagsResponse } from "@/lib/api/types";
import Image from "next/image";

const STEPS = [
  "basics",
  "gender",
  "orientation",
  "relationship",
  "photos",
  "bio",
  "tags",
  "preferences",
] as const;

type Step = (typeof STEPS)[number];

const genderOptions = ["Man", "Woman", "Non-Binary", "Other"];
const orientationOptions = [
  "Straight",
  "Gay",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Asexual",
  "Queer",
  "Questioning",
  "Prefer not to say",
];
const relationshipOptions = [
  { type: "Long-term", color: "#E53935" },
  { type: "Short-term", color: "#FF6F61" },
  { type: "Casual", color: "#FFC107" },
  { type: "Friendship", color: "#4CAF50" },
  { type: "Not sure yet", color: "#2196F3" },
];
const interestedInOptions = ["Man", "Woman", "Non-Binary", "Everyone"];

export default function SetupPage() {
  const router = useRouter();
  const { completeProfileSetup } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<ApiTag[]>([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [maxDistance, setMaxDistance] = useState(50);
  const [interestedIn, setInterestedIn] = useState<string[]>([]);

  const step = STEPS[currentStep];

  const loadTags = useCallback(async () => {
    try {
      const response = await apiGet<TagsResponse>(ENDPOINTS.TAGS);
      setAvailableTags(response.data.tags || []);
    } catch {
      // non-critical
    }
  }, []);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case "basics":
        return name.trim().length >= 2 && age && parseInt(age) >= 18;
      case "gender":
        return !!gender;
      case "orientation":
        return true; // optional
      case "relationship":
        return relationshipTypes.length > 0;
      case "photos":
        return photos.length >= 1;
      case "bio":
        return bio.trim().length >= 10;
      case "tags":
        return true; // optional
      case "preferences":
        return interestedIn.length > 0;
      default:
        return false;
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Update profile
      await put(ENDPOINTS.USERS.PROFILE, {
        name: name.trim(),
        age: parseInt(age),
        gender,
        bio: bio.trim(),
        sexual_orientation: orientation || undefined,
        pronouns: pronouns || undefined,
        relationship_types: relationshipTypes.map((type) => ({
          type,
          border_color:
            relationshipOptions.find((r) => r.type === type)?.color || "#E53935",
        })),
      });

      // Upload photos
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("photo", photo.file);
        await postFormData(ENDPOINTS.USERS.UPLOAD_PHOTO, formData);
      }

      // Update preferences
      await put(ENDPOINTS.USERS.PREFERENCES, {
        age_min: ageMin,
        age_max: ageMax,
        max_distance: maxDistance,
        interested_in: interestedIn.map((i) => i.toLowerCase()),
      });

      // Add tags
      for (const tagId of selectedTags) {
        try {
          await import("@/lib/api/client").then((m) =>
            m.post(ENDPOINTS.USERS.TAGS, { tag_id: tagId })
          );
        } catch {
          // continue
        }
      }

      completeProfileSetup({ name: name.trim() });
      router.push("/feed");
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      handleFinish();
    } else {
      if (STEPS[currentStep + 1] === "tags" && availableTags.length === 0) {
        loadTags();
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-6">
        <ProgressBar current={currentStep + 1} total={STEPS.length} />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {step === "basics" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Let's get started
                    </h2>
                    <p className="text-text-secondary">
                      Tell us a bit about yourself
                    </p>
                  </div>
                  <Input
                    label="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should people call you?"
                  />
                  <Input
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                    min={18}
                    max={100}
                  />
                  <Input
                    label="Pronouns (optional)"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    placeholder="e.g. he/him, she/her, they/them"
                  />
                </div>
              )}

              {step === "gender" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      What's your gender?
                    </h2>
                    <p className="text-text-secondary">
                      Select how you identify
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setGender(opt)}
                        className={`p-4 rounded-xl border text-center font-medium transition-all ${
                          gender === opt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-text-secondary hover:border-border-light"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "orientation" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Sexual orientation
                    </h2>
                    <p className="text-text-secondary">
                      This is optional and you can change it anytime
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {orientationOptions.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={orientation === opt}
                        onClick={() =>
                          setOrientation(orientation === opt ? "" : opt)
                        }
                        variant="outline"
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === "relationship" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      What are you looking for?
                    </h2>
                    <p className="text-text-secondary">
                      Select one or more relationship types
                    </p>
                  </div>
                  <div className="space-y-3">
                    {relationshipOptions.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() =>
                          setRelationshipTypes((prev) =>
                            prev.includes(opt.type)
                              ? prev.filter((t) => t !== opt.type)
                              : [...prev, opt.type]
                          )
                        }
                        className={`w-full p-4 rounded-xl border text-left font-medium transition-all flex items-center gap-3 ${
                          relationshipTypes.includes(opt.type)
                            ? "border-primary bg-primary/10 text-white"
                            : "border-border bg-card text-text-secondary hover:border-border-light"
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                        {opt.type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "photos" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Add your best photos
                    </h2>
                    <p className="text-text-secondary">
                      Upload at least 1 photo (up to 6)
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card"
                      >
                        <Image
                          src={photo.preview}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-error/80 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-primary px-2 py-0.5 rounded-full text-white">
                            PRIMARY
                          </span>
                        )}
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors bg-card/50">
                        <Plus className="w-8 h-8 text-text-muted mb-1" />
                        <span className="text-xs text-text-muted">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoAdd}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {step === "bio" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Write your bio
                    </h2>
                    <p className="text-text-secondary">
                      Tell people what makes you interesting
                    </p>
                  </div>
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share something about yourself..."
                      maxLength={500}
                      rows={5}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    />
                    <p className="text-right text-xs text-text-muted mt-1">
                      {bio.length}/500
                    </p>
                  </div>
                </div>
              )}

              {step === "tags" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Your interests
                    </h2>
                    <p className="text-text-secondary">
                      Pick tags that describe you (optional)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <Chip
                        key={tag.tag_id}
                        label={tag.name}
                        selected={selectedTags.includes(tag.tag_id)}
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag.tag_id)
                              ? prev.filter((t) => t !== tag.tag_id)
                              : [...prev, tag.tag_id]
                          )
                        }
                        variant="outline"
                      />
                    ))}
                    {availableTags.length === 0 && (
                      <p className="text-text-muted text-sm">
                        Loading tags...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === "preferences" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Your preferences
                    </h2>
                    <p className="text-text-secondary">
                      Who would you like to meet?
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-3">
                      Interested in
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {interestedInOptions.map((opt) => (
                        <Chip
                          key={opt}
                          label={opt}
                          selected={interestedIn.includes(opt)}
                          onClick={() =>
                            setInterestedIn((prev) =>
                              prev.includes(opt)
                                ? prev.filter((i) => i !== opt)
                                : [...prev, opt]
                            )
                          }
                          variant="outline"
                        />
                      ))}
                    </div>
                  </div>

                  <Slider
                    label="Minimum Age"
                    min={18}
                    max={100}
                    value={ageMin}
                    onChange={setAgeMin}
                  />
                  <Slider
                    label="Maximum Age"
                    min={18}
                    max={100}
                    value={ageMax}
                    onChange={setAgeMax}
                  />
                  <Slider
                    label="Maximum Distance"
                    min={1}
                    max={200}
                    value={maxDistance}
                    onChange={setMaxDistance}
                    suffix=" km"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 pb-6 flex gap-3">
        {currentStep > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={handleNext}
          size="lg"
          fullWidth
          disabled={!canProceed()}
          isLoading={isSubmitting}
        >
          {currentStep === STEPS.length - 1 ? (
            "Complete Setup"
          ) : (
            <span className="flex items-center gap-2">
              Continue <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
