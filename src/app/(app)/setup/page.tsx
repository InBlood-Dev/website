"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { put, postFormData } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { get as apiGet } from "@/lib/api/client";
import Input from "@/components/ui/Input";
import Chip from "@/components/ui/Chip";
import Slider from "@/components/ui/Slider";
import { Plus, X, ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
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

const stepLabels: Record<Step, string> = {
  basics: "Basics",
  gender: "Gender",
  orientation: "Orientation",
  relationship: "Looking for",
  photos: "Photos",
  bio: "Bio",
  tags: "Interests",
  preferences: "Preferences",
};

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
  "Other",
];
const relationshipOptions = [
  { type: "Serious", color: "#9370DB", emoji: "💘" },
  { type: "Dating", color: "#FF69B4", emoji: "🔥" },
  { type: "Casual", color: "#FF6347", emoji: "✨" },
  { type: "Friendship", color: "#FFD700", emoji: "🤝" },
  { type: "Open", color: "#32CD32", emoji: "🌈" },
  { type: "Flexible", color: "#32CD32", emoji: "🤷" },
];
const interestedInOptions = ["Man", "Woman", "Non-Binary", "Everyone"];

export default function SetupPage() {
  const router = useRouter();
  const { completeProfileSetup } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch {}
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
        return true;
      case "relationship":
        return relationshipTypes.length > 0;
      case "photos":
        return photos.length >= 1;
      case "bio":
        return bio.trim().length >= 10;
      case "tags":
        return true;
      case "preferences":
        return interestedIn.length > 0;
      default:
        return false;
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Update basic profile
      await put(ENDPOINTS.USERS.PROFILE, {
        name: name.trim(),
        age: parseInt(age),
        gender,
        bio: bio.trim(),
        sexual_orientation: orientation || undefined,
        pronouns: pronouns || undefined,
      });

      // Update relationship types via separate endpoint
      if (relationshipTypes.length > 0) {
        await import("@/lib/api/client").then((m) =>
          m.post(ENDPOINTS.USERS.RELATIONSHIP_TYPES, { types: relationshipTypes })
        );
      }

      for (const photo of photos) {
        const formData = new FormData();
        formData.append("photo", photo.file);
        await postFormData(ENDPOINTS.USERS.UPLOAD_PHOTO, formData);
      }

      await put(ENDPOINTS.USERS.PREFERENCES, {
        age_min: ageMin,
        age_max: ageMax,
        proximity_range: maxDistance,
        interested_in: interestedIn.map((i) => i.toLowerCase()),
      });

      if (selectedTags.length > 0) {
        try {
          await import("@/lib/api/client").then((m) =>
            m.post(ENDPOINTS.USERS.TAGS, { tag_ids: selectedTags })
          );
        } catch {}
      }

      completeProfileSetup({ name: name.trim() });
      router.push("/discover");
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Large ambient glow orbs */}
      <div className="fixed top-[-30%] left-[30%] w-[800px] h-[800px] rounded-full bg-primary/[0.035] blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-15%] w-[600px] h-[600px] rounded-full bg-primary-light/[0.025] blur-[130px] pointer-events-none" />
      <div className="fixed top-[40%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 px-6 md:px-10 pt-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-[10px]" />
              <Image src="/logo.png" alt="InBlood" width={32} height={32} className="relative z-10 rounded-lg object-contain" />
            </div>
            <div>
              <span className="text-white font-medium text-sm block">InBlood</span>
              <span className="text-white/20 text-[10px] uppercase tracking-[0.15em]">Profile Setup</span>
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/20">
            {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        {/* Step progress - animated bars */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/[0.06]"
            >
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{
                  width: i < currentStep ? "100%" : i === currentStep ? "50%" : "0%",
                  backgroundColor: i <= currentStep ? "#E53935" : "transparent",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-6 relative z-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step label + heading */}
              <div className="mb-10">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium mb-3 block"
                >
                  {stepLabels[step]}
                </motion.span>

                {step === "basics" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">Let&apos;s get<br /><span className="gradient-text font-medium">started</span></h2>
                    <p className="text-white/30 text-[15px]">Tell us a bit about yourself</p>
                  </>
                )}
                {step === "gender" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">What&apos;s your<br /><span className="gradient-text font-medium">gender?</span></h2>
                    <p className="text-white/30 text-[15px]">Select how you identify</p>
                  </>
                )}
                {step === "orientation" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">Sexual<br /><span className="gradient-text font-medium">orientation</span></h2>
                    <p className="text-white/30 text-[15px]">This is optional — change it anytime</p>
                  </>
                )}
                {step === "relationship" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">What are you<br /><span className="gradient-text font-medium">looking for?</span></h2>
                    <p className="text-white/30 text-[15px]">Select one or more</p>
                  </>
                )}
                {step === "photos" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">Add your<br /><span className="gradient-text font-medium">best photos</span></h2>
                    <p className="text-white/30 text-[15px]">Upload at least 1 photo (up to 6)</p>
                  </>
                )}
                {step === "bio" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">Write your<br /><span className="gradient-text font-medium">bio</span></h2>
                    <p className="text-white/30 text-[15px]">Tell people what makes you interesting</p>
                  </>
                )}
                {step === "tags" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">Your<br /><span className="gradient-text font-medium">interests</span></h2>
                    <p className="text-white/30 text-[15px]">Pick tags that describe you (optional)</p>
                  </>
                )}
                {step === "preferences" && (
                  <>
                    <h2 className="text-4xl font-light text-white mb-3 tracking-tight leading-[1.1]">Your<br /><span className="gradient-text font-medium">preferences</span></h2>
                    <p className="text-white/30 text-[15px]">Who would you like to meet?</p>
                  </>
                )}
              </div>

              {/* Step content */}
              {step === "basics" && (
                <div className="space-y-5">
                  <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should people call you?" />
                  <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Your age" min={18} max={100} />
                  <Input label="Pronouns (optional)" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="e.g. he/him, she/her, they/them" />
                </div>
              )}

              {step === "gender" && (
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((opt) => (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setGender(opt)}
                      className={`p-5 rounded-2xl border text-center font-medium transition-all text-[15px] relative overflow-hidden ${
                        gender === opt
                          ? "border-primary/50 bg-primary/10 text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white/60"
                      }`}
                    >
                      {gender === opt && (
                        <motion.div
                          layoutId="gender-selected"
                          className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl"
                          transition={{ type: "spring", duration: 0.4 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {gender === opt && <Check className="w-4 h-4 text-primary" />}
                        {opt}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {step === "orientation" && (
                <div className="flex flex-wrap gap-2.5">
                  {orientationOptions.map((opt) => (
                    <Chip key={opt} label={opt} selected={orientation === opt} onClick={() => setOrientation(orientation === opt ? "" : opt)} variant="outline" />
                  ))}
                </div>
              )}

              {step === "relationship" && (
                <div className="space-y-3">
                  {relationshipOptions.map((opt) => (
                    <motion.button
                      key={opt.type}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setRelationshipTypes((prev) =>
                          prev.includes(opt.type) ? prev.filter((t) => t !== opt.type) : prev.length < 3 ? [...prev, opt.type] : prev
                        )
                      }
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 text-[15px] ${
                        relationshipTypes.includes(opt.type)
                          ? "border-primary/40 bg-primary/8 text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="flex-1 font-medium">{opt.type}</span>
                      {relationshipTypes.includes(opt.type) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {step === "photos" && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]"
                    >
                      <Image src={photo.preview} alt={`Photo ${index + 1}`} fill className="object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-primary px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider">
                          Primary
                        </span>
                      )}
                    </motion.div>
                  ))}
                  {photos.length < 6 && (
                    <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-primary/40 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.02] hover:bg-primary/[0.03] group">
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
                        <Plus className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors">Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoAdd} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {step === "bio" && (
                <div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share something about yourself..."
                    maxLength={500}
                    rows={6}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white text-[15px] leading-relaxed placeholder:text-white/15 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-white/15">{bio.length >= 10 ? "Looking good!" : `${10 - bio.length} more characters needed`}</p>
                    <p className="text-xs text-white/15">{bio.length}/500</p>
                  </div>
                </div>
              )}

              {step === "tags" && (
                <div className="flex flex-wrap gap-2.5 max-h-80 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <Chip
                      key={tag.tag_id}
                      label={tag.name}
                      selected={selectedTags.includes(tag.tag_id)}
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag.tag_id) ? prev.filter((t) => t !== tag.tag_id) : [...prev, tag.tag_id]
                        )
                      }
                      variant="outline"
                    />
                  ))}
                  {availableTags.length === 0 && (
                    <div className="flex items-center gap-3 text-white/25 text-sm">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
                      Loading tags...
                    </div>
                  )}
                </div>
              )}

              {step === "preferences" && (
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-4">Interested in</p>
                    <div className="flex flex-wrap gap-2.5">
                      {interestedInOptions.map((opt) => (
                        <Chip
                          key={opt}
                          label={opt}
                          selected={interestedIn.includes(opt)}
                          onClick={() =>
                            setInterestedIn((prev) => (prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]))
                          }
                          variant="outline"
                        />
                      ))}
                    </div>
                  </div>
                  <Slider label="Minimum Age" min={18} max={100} value={ageMin} onChange={setAgeMin} />
                  <Slider label="Maximum Age" min={18} max={100} value={ageMax} onChange={setAgeMax} />
                  <Slider label="Maximum Distance" min={1} max={100} value={maxDistance} onChange={setMaxDistance} suffix=" km" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-10 px-6 md:px-10 pb-8 pt-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          {currentStep > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="w-14 h-14 rounded-full border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.03] transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="flex-1 h-14 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-full transition-all disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-[15px] shadow-xl shadow-primary/25 hover:shadow-primary/35 hover:brightness-110"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Setting up...
              </div>
            ) : currentStep === STEPS.length - 1 ? (
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5" />
                Complete Setup
              </span>
            ) : (
              <span className="flex items-center gap-2.5">
                Continue
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
