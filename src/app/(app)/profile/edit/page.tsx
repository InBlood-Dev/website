"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/stores/user.store";
import { useUIStore } from "@/stores/ui.store";
import { get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Chip from "@/components/ui/Chip";
import Slider from "@/components/ui/Slider";
import type { ApiTag } from "@/lib/api/types";
import { posthog } from "@/lib/analytics/posthog";
import {
  Plus,
  X,
  ChevronDown,
  Camera,
  Star,
  Sparkles,
  MessageCircle,
  Globe,
  Heart,
  Tags,
} from "lucide-react";

// ─── Constants (matching mobile app) ─────────────────────────────────────

const PROFILE_PROMPTS = [
  { id: "perfect_date", title: "My perfect first date..." },
  { id: "never_shut_up", title: "I'll never shut up about..." },
  { id: "love_language", title: "My love language is..." },
  { id: "deal_breaker", title: "My biggest deal breaker..." },
  { id: "weekend_vibes", title: "My weekend vibe is..." },
  { id: "guilty_pleasure", title: "My guilty pleasure is..." },
  { id: "green_flag", title: "A green flag I look for..." },
  { id: "hottest_take", title: "My hottest take..." },
  { id: "young_mischievous", title: "How young and mischievous are you?" },
  { id: "secret_fantasy", title: "My secret fantasy is..." },
  { id: "turn_ons", title: "What really turns me on..." },
  { id: "wild_side", title: "My wild side comes out when..." },
  { id: "bedroom_vibe", title: "In the bedroom, I am..." },
  { id: "naughty_confession", title: "A naughty confession..." },
  { id: "seduction_style", title: "My seduction style is..." },
  { id: "kinkiest_thing", title: "The kinkiest thing about me..." },
];

const OPENING_MOVES = [
  { id: "open_1", title: "If we matched, I'd want to know..." },
  { id: "open_2", title: "Best way to start a convo with me..." },
  { id: "open_3", title: "Let's debate: ..." },
  { id: "open_4", title: "Ask me about..." },
  { id: "open_5", title: "Two truths and a lie:" },
];

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Mandarin", "Japanese",
  "Korean", "Portuguese", "Italian", "Arabic", "Russian", "Tamil", "Telugu",
  "Bengali", "Marathi", "Gujarati", "Punjabi", "Kannada", "Malayalam",
];

const SEXUAL_ORIENTATIONS = [
  "Straight", "Gay", "Lesbian", "Bisexual", "Pansexual",
  "Asexual", "Demisexual", "Queer", "Questioning",
  "Omnisexual", "Polysexual", "Homoflexible", "Heteroflexible",
  "Androsexual", "Gynesexual", "Skoliosexual", "Sapiosexual",
  "Aromantic", "Graysexual", "Fluid",
];

const PRONOUNS_OPTIONS = [
  "He/Him", "She/Her", "They/Them",
  "He/They", "She/They", "Ze/Hir", "Xe/Xem",
  "Any Pronouns", "Prefer Not to Say",
];

// ─── Types ──────────────────────────────────────────────────────────────

interface PromptAnswer {
  promptId: string;
  promptTitle: string;
  answer: string;
}

// ─── Component ──────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, fetchProfile, updateProfile, uploadPhoto, deletePhoto, setPrimaryPhoto, addTag, removeTag, updatePreferences } = useUserStore();
  const addToast = useUIStore((s) => s.addToast);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [orientation, setOrientation] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [promptAnswers, setPromptAnswers] = useState<PromptAnswer[]>([]);
  const [openingMoves, setOpeningMoves] = useState<PromptAnswer[]>([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [maxDistance, setMaxDistance] = useState(25);

  // Tags
  const [availableTags, setAvailableTags] = useState<ApiTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Modals
  const [activeModal, setActiveModal] = useState<
    null | "orientation" | "pronouns" | "prompts" | "opening_moves" | "languages" | "tags" | "photo_options"
  >(null);
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; title: string } | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [photoOptionsIndex, setPhotoOptionsIndex] = useState(0);

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setPronouns(profile.pronouns || "");
      setOrientation(profile.sexual_orientation || "");
      setSelectedLanguages(profile.languages || []);
      setAgeMin(profile.preference_age_min || profile.age_min || 18);
      setAgeMax(profile.preference_age_max || profile.age_max || 35);
      setMaxDistance(profile.preference_max_distance || profile.proximity_range || 25);

      if (profile.prompts?.length) {
        setPromptAnswers(
          profile.prompts.map((p, i) => {
            const matched = PROFILE_PROMPTS.find(
              (pp) => pp.title.toLowerCase() === p.question.toLowerCase()
            );
            return { promptId: matched?.id || `prompt_${i}`, promptTitle: p.question, answer: p.answer };
          })
        );
      }

      if (profile.opening_moves?.length) {
        setOpeningMoves(
          profile.opening_moves.map((m, i) => {
            const matched = OPENING_MOVES.find(
              (om) => om.title.toLowerCase() === m.question.toLowerCase()
            );
            return { promptId: matched?.id || `move_${i}`, promptTitle: m.question, answer: m.answer };
          })
        );
      }
    }
  }, [profile]);

  // Fetch available tags
  useEffect(() => {
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiGet<any>(ENDPOINTS.TAGS);
        const tags = res.data?.tags || res.data || [];
        setAvailableTags(Array.isArray(tags) ? tags : []);
      } catch {
        // Tags unavailable
      }
    })();
  }, []);

  // Sync selected tag IDs from profile
  useEffect(() => {
    if (profile?.tags && availableTags.length > 0) {
      const ids = profile.tags
        .map((t) => {
          if (typeof t === "string") {
            const found = availableTags.find(
              (at) => at.name.toLowerCase() === t.toLowerCase()
            );
            return found?.tag_id;
          }
          return t.tag_id;
        })
        .filter((id): id is string => !!id);
      setSelectedTagIds(ids);
    }
  }, [profile?.tags, availableTags]);

  // Profile strength (same algo as mobile app)
  const profileStrength = useMemo(() => {
    let score = 0;
    const photoCount = profile?.photos?.length || 0;
    score += Math.min(photoCount * 5, 30);
    if (bio.length > 0) score += 5;
    if (bio.length > 50) score += 5;
    if (bio.length > 100) score += 5;
    score += Math.min(promptAnswers.length * 5, 20);
    score += Math.min(openingMoves.length * 5, 10);
    if (selectedLanguages.length > 0) score += 2.5;
    if (selectedLanguages.length > 1) score += 2.5;
    return Math.min(Math.round(score), 100);
  }, [profile?.photos, bio, promptAnswers, openingMoves, selectedLanguages]);

  const strengthColor =
    profileStrength < 30 ? "bg-error" : profileStrength < 60 ? "bg-warning" : profileStrength < 80 ? "bg-success" : "bg-info";
  const strengthLabel =
    profileStrength < 30 ? "Needs Work" : profileStrength < 60 ? "Getting There" : profileStrength < 80 ? "Looking Good" : "All Star";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto(file);
      await fetchProfile();
      posthog?.capture("photo_uploaded", { source: "profile_edit" });
      addToast({ message: "Photo uploaded!", type: "success" });
    } catch {
      addToast({ message: "Failed to upload photo", type: "error" });
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if ((profile?.photos?.length || 0) <= 1) {
      addToast({ message: "You must have at least one photo", type: "error" });
      return;
    }
    try {
      await deletePhoto(photoId);
      await fetchProfile();
      addToast({ message: "Photo deleted", type: "info" });
    } catch {
      addToast({ message: "Failed to delete photo", type: "error" });
    }
    setActiveModal(null);
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await setPrimaryPhoto(photoId);
      await fetchProfile();
      addToast({ message: "Primary photo updated", type: "success" });
    } catch {
      addToast({ message: "Failed to set primary photo", type: "error" });
    }
    setActiveModal(null);
  };

  const handleToggleTag = async (tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId);
    setSelectedTagIds((prev) =>
      isSelected ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
    try {
      if (isSelected) {
        await removeTag(tagId);
      } else {
        await addTag(tagId);
      }
    } catch {
      setSelectedTagIds((prev) =>
        isSelected ? [...prev, tagId] : prev.filter((id) => id !== tagId)
      );
      addToast({ message: "Failed to update tag", type: "error" });
    }
  };

  const handleSavePrompt = (isOpeningMove: boolean) => {
    if (!editingPrompt || !promptInput.trim()) return;
    const answer: PromptAnswer = {
      promptId: editingPrompt.id,
      promptTitle: editingPrompt.title,
      answer: promptInput.trim(),
    };
    if (isOpeningMove) {
      setOpeningMoves((prev) => [...prev.filter((p) => p.promptId !== editingPrompt.id), answer]);
    } else {
      setPromptAnswers((prev) => [...prev.filter((p) => p.promptId !== editingPrompt.id), answer]);
    }
    setEditingPrompt(null);
    setPromptInput("");
    setActiveModal(null);
  };

  const handleRemovePrompt = (promptId: string, isOpeningMove: boolean) => {
    if (isOpeningMove) {
      setOpeningMoves((prev) => prev.filter((p) => p.promptId !== promptId));
    } else {
      setPromptAnswers((prev) => prev.filter((p) => p.promptId !== promptId));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        pronouns: pronouns.trim() || null,
        sexual_orientation: orientation.trim() || null,
        languages: selectedLanguages,
        prompts: promptAnswers.map((p) => ({ question: p.promptTitle, answer: p.answer })),
        opening_moves: openingMoves.map((p) => ({ question: p.promptTitle, answer: p.answer })),
      } as Record<string, unknown>);

      await updatePreferences({
        age_min: ageMin,
        age_max: ageMax,
        proximity_range: maxDistance,
      });

      addToast({ message: "Profile updated!", type: "success" });
      router.push("/profile");
    } catch {
      addToast({ message: "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
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
          className="px-5 py-1.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
        {/* Profile Strength */}
        <div className="px-6 pt-5 pb-3">
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-white">Profile Strength</span>
              </div>
              <span className="text-sm font-medium text-white">{profileStrength}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            <p className="text-xs text-white/30 mt-2">{strengthLabel}</p>
          </div>
        </div>

        {/* Photos */}
        <Section title="Photos" icon={<Camera className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo._id}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.04] group border border-white/[0.06] cursor-pointer"
                onClick={() => {
                  setPhotoOptionsIndex(index);
                  setActiveModal("photo_options");
                }}
              >
                <Image src={photo.url} alt="Photo" fill className="object-cover" sizes="200px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-xs text-white font-medium">Tap to edit</span>
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
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        </Section>

        {/* About Me */}
        <Section title="About Me">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-white/25 mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="mt-4">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-white/25 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell people about yourself..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
            <p className="text-right text-xs text-white/20 mt-1">{bio.length}/500</p>
          </div>
        </Section>

        {/* Sexual Orientation */}
        <Section title="Sexual Orientation" icon={<Heart className="w-4 h-4" />}>
          <DropdownSelector
            value={orientation}
            placeholder="Select your orientation"
            onClick={() => setActiveModal("orientation")}
          />
        </Section>

        {/* Pronouns */}
        <Section title="Pronouns">
          <DropdownSelector
            value={pronouns}
            placeholder="Select your pronouns"
            onClick={() => setActiveModal("pronouns")}
          />
        </Section>

        {/* Profile Prompts */}
        <Section title="More About You" icon={<MessageCircle className="w-4 h-4" />}>
          <div className="space-y-3">
            {promptAnswers.map((pa) => (
              <PromptCard
                key={pa.promptId}
                question={pa.promptTitle}
                answer={pa.answer}
                onRemove={() => handleRemovePrompt(pa.promptId, false)}
              />
            ))}
            <button
              onClick={() => {
                setEditingPrompt(null);
                setPromptInput("");
                setActiveModal("prompts");
              }}
              className="w-full py-3 border-2 border-dashed border-white/[0.08] rounded-xl text-white/30 text-sm hover:border-primary/30 hover:text-primary/60 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add a Prompt
            </button>
          </div>
        </Section>

        {/* Opening Moves */}
        <Section title="Opening Moves" icon={<Star className="w-4 h-4" />}>
          <div className="space-y-3">
            {openingMoves.map((om) => (
              <PromptCard
                key={om.promptId}
                question={om.promptTitle}
                answer={om.answer}
                onRemove={() => handleRemovePrompt(om.promptId, true)}
              />
            ))}
            <button
              onClick={() => {
                setEditingPrompt(null);
                setPromptInput("");
                setActiveModal("opening_moves");
              }}
              className="w-full py-3 border-2 border-dashed border-white/[0.08] rounded-xl text-white/30 text-sm hover:border-primary/30 hover:text-primary/60 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add an Opening Move
            </button>
          </div>
        </Section>

        {/* Languages */}
        <Section title="Languages I Speak" icon={<Globe className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-2">
            {selectedLanguages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                selected
                removable
                onRemove={() => setSelectedLanguages((prev) => prev.filter((l) => l !== lang))}
                size="sm"
              />
            ))}
            <button
              onClick={() => setActiveModal("languages")}
              className="px-3 py-1 border border-dashed border-white/[0.1] rounded-full text-white/30 text-xs hover:border-primary/30 hover:text-primary/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </Section>

        {/* Tags */}
        <Section title="Your Tags" icon={<Tags className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-2">
            {selectedTagIds.map((tagId) => {
              const tag = availableTags.find((t) => t.tag_id === tagId);
              if (!tag) return null;
              return (
                <Chip
                  key={tagId}
                  label={tag.name}
                  selected
                  removable
                  onRemove={() => handleToggleTag(tagId)}
                  size="sm"
                />
              );
            })}
            <button
              onClick={() => setActiveModal("tags")}
              className="px-3 py-1 border border-dashed border-white/[0.1] rounded-full text-white/30 text-xs hover:border-primary/30 hover:text-primary/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Tags
            </button>
          </div>
        </Section>

        {/* Match Preferences */}
        <Section title="Match Preferences">
          <div className="space-y-6">
            <Slider label="Min Age" min={18} max={99} value={ageMin} onChange={setAgeMin} />
            <Slider label="Max Age" min={18} max={99} value={ageMax} onChange={setAgeMax} />
            <Slider label="Max Distance" min={1} max={100} value={maxDistance} onChange={setMaxDistance} suffix=" km" />
          </div>
        </Section>
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────── */}

      {activeModal === "orientation" && (
        <SelectModal
          title="Sexual Orientation"
          options={SEXUAL_ORIENTATIONS}
          selected={orientation}
          onSelect={(val) => { setOrientation(val); setActiveModal(null); }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "pronouns" && (
        <SelectModal
          title="Pronouns"
          options={PRONOUNS_OPTIONS}
          selected={pronouns}
          onSelect={(val) => { setPronouns(val); setActiveModal(null); }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "prompts" && (
        <PromptSelectorModal
          title="Choose a Prompt"
          prompts={PROFILE_PROMPTS}
          existingIds={promptAnswers.map((p) => p.promptId)}
          editingPrompt={editingPrompt}
          promptInput={promptInput}
          onSelectPrompt={(p) => {
            setEditingPrompt(p);
            const existing = promptAnswers.find((pa) => pa.promptId === p.id);
            setPromptInput(existing?.answer || "");
          }}
          onInputChange={setPromptInput}
          onSave={() => handleSavePrompt(false)}
          onClose={() => { setActiveModal(null); setEditingPrompt(null); setPromptInput(""); }}
        />
      )}

      {activeModal === "opening_moves" && (
        <PromptSelectorModal
          title="Opening Moves"
          prompts={OPENING_MOVES}
          existingIds={openingMoves.map((p) => p.promptId)}
          editingPrompt={editingPrompt}
          promptInput={promptInput}
          onSelectPrompt={(p) => {
            setEditingPrompt(p);
            const existing = openingMoves.find((om) => om.promptId === p.id);
            setPromptInput(existing?.answer || "");
          }}
          onInputChange={setPromptInput}
          onSave={() => handleSavePrompt(true)}
          onClose={() => { setActiveModal(null); setEditingPrompt(null); setPromptInput(""); }}
        />
      )}

      {activeModal === "languages" && (
        <MultiSelectModal
          title="Languages I Speak"
          options={LANGUAGES}
          selected={selectedLanguages}
          onToggle={(lang) =>
            setSelectedLanguages((prev) =>
              prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
            )
          }
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "tags" && (
        <TagsModal
          tags={availableTags}
          selectedIds={selectedTagIds}
          onToggle={handleToggleTag}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "photo_options" && photos[photoOptionsIndex] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setActiveModal(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4">
            <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/[0.08]">
              <div className="relative aspect-[3/4] w-full">
                <Image src={photos[photoOptionsIndex].url} alt="Photo" fill className="object-cover" sizes="400px" />
              </div>
              <div className="p-2 space-y-1">
                {!photos[photoOptionsIndex].is_primary && (
                  <button
                    onClick={() => handleSetPrimary(photos[photoOptionsIndex]._id)}
                    className="w-full py-3 text-sm text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                  >
                    Set as Primary
                  </button>
                )}
                <label className="w-full py-3 text-sm text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer flex items-center justify-center">
                  Replace Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        await deletePhoto(photos[photoOptionsIndex]._id);
                        await uploadPhoto(file);
                        await fetchProfile();
                        addToast({ message: "Photo replaced!", type: "success" });
                      } catch {
                        addToast({ message: "Failed to replace photo", type: "error" });
                      }
                      setActiveModal(null);
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => handleDeletePhoto(photos[photoOptionsIndex]._id)}
                  className="w-full py-3 text-sm text-error hover:bg-error/10 rounded-xl transition-colors"
                >
                  Remove Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25">{title}</h3>
      </div>
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">{children}</div>
    </div>
  );
}

function DropdownSelector({ value, placeholder, onClick }: { value: string; placeholder: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-primary/30 transition-colors"
    >
      <span className={value ? "text-white text-sm" : "text-white/25 text-sm"}>{value || placeholder}</span>
      <ChevronDown className="w-4 h-4 text-white/25" />
    </button>
  );
}

function PromptCard({ question, answer, onRemove }: { question: string; answer: string; onRemove: () => void }) {
  return (
    <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] relative group">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 p-1 text-white/15 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-white/40 text-xs font-medium mb-1.5">{question}</p>
      <p className="text-white text-sm leading-relaxed">{answer}</p>
    </div>
  );
}

function SelectModal({
  title, options, selected, onSelect, onClose,
}: {
  title: string; options: string[]; selected: string; onSelect: (val: string) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-6 pb-24 md:pb-6 md:mx-4 max-h-[80vh] flex flex-col">
        <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-5 md:hidden" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                selected === opt ? "bg-primary/15 text-primary border border-primary/30" : "text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MultiSelectModal({
  title, options, selected, onToggle, onClose,
}: {
  title: string; options: string[]; selected: string[]; onToggle: (val: string) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-6 pb-24 md:pb-6 md:mx-4 max-h-[80vh] flex flex-col">
        <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-5 md:hidden" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)} variant="outline" size="sm" />
            ))}
          </div>
        </div>
        <button onClick={onClose} className="mt-5 w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
          Done
        </button>
      </div>
    </div>
  );
}

function PromptSelectorModal({
  title, prompts, existingIds, editingPrompt, promptInput, onSelectPrompt, onInputChange, onSave, onClose,
}: {
  title: string; prompts: { id: string; title: string }[]; existingIds: string[];
  editingPrompt: { id: string; title: string } | null; promptInput: string;
  onSelectPrompt: (p: { id: string; title: string }) => void; onInputChange: (val: string) => void;
  onSave: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-6 pb-24 md:pb-6 md:mx-4 max-h-[80vh] flex flex-col">
        <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-5 md:hidden" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-white">{editingPrompt ? "Answer Prompt" : title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        {editingPrompt ? (
          <div className="flex-1">
            <p className="text-white/50 text-sm mb-3">{editingPrompt.title}</p>
            <textarea
              value={promptInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Type your answer..."
              rows={4}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              autoFocus
            />
            <button
              onClick={onSave}
              disabled={!promptInput.trim()}
              className="mt-4 w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-40"
            >
              Save Answer
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1">
            {prompts.map((prompt) => {
              const alreadyAdded = existingIds.includes(prompt.id);
              return (
                <button
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center justify-between ${
                    alreadyAdded ? "bg-primary/10 text-primary/70 border border-primary/20" : "text-white/60 hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{prompt.title}</span>
                  {alreadyAdded && <span className="text-xs text-primary/50">Edit</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TagsModal({
  tags, selectedIds, onToggle, onClose,
}: {
  tags: ApiTag[]; selectedIds: string[]; onToggle: (tagId: string) => void; onClose: () => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, ApiTag[]>();
    tags.forEach((tag) => {
      const cat = tag.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(tag);
    });
    return map;
  }, [tags]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-6 pb-24 md:pb-6 md:mx-4 max-h-[80vh] flex flex-col">
        <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-5 md:hidden" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-white">Your Tags</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.1] flex items-center justify-center">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-5">
          {Array.from(grouped.entries()).map(([category, catTags]) => (
            <div key={category}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {catTags.map((tag) => (
                  <Chip
                    key={tag.tag_id}
                    label={tag.name}
                    selected={selectedIds.includes(tag.tag_id)}
                    onClick={() => onToggle(tag.tag_id)}
                    variant="outline"
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
          Done
        </button>
      </div>
    </div>
  );
}
