"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { useUIStore } from "@/stores/ui.store";
import { put, post, get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Chip from "@/components/ui/Chip";
import Slider from "@/components/ui/Slider";
import {
  User,
  Shield,
  Ban,
  Crown,
  LogOut,
  ChevronRight,
  EyeOff,
  MapPin,
  Bell,
  HelpCircle,
  ShieldCheck,
  FileText,
  Info,
  Star,
  Share2,
  BadgeCheck,
  Loader2,
} from "lucide-react";

const DISTANCE_OPTIONS = ["exact", "approximate", "hide"] as const;
type DistanceOption = (typeof DISTANCE_OPTIONS)[number];
const DISTANCE_LABELS: Record<DistanceOption, string> = {
  exact: "Exact distance",
  approximate: "Approximate",
  hide: "Hidden",
};
const DISTANCE_BADGE: Record<DistanceOption, string> = {
  exact: "Exact",
  approximate: "Approx",
  hide: "Off",
};

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const addToast = useUIStore((s) => s.addToast);

  // Privacy
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [showDistance, setShowDistance] = useState<DistanceOption>("exact");
  const [savingSettings, setSavingSettings] = useState(false);

  // Discovery preferences
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [maxDistance, setMaxDistance] = useState(50);
  const [interestedIn, setInterestedIn] = useState<string[]>(["everyone"]);

  // Verification
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

  // Logout confirm
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setAgeMin(profile.preference_age_min || profile.age_min || 18);
      setAgeMax(profile.preference_age_max || profile.age_max || 35);
      setMaxDistance(profile.preference_max_distance || profile.proximity_range || 50);
      if (profile.interested_in?.length) setInterestedIn(profile.interested_in);
    }
  }, [profile]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ status: string }>(ENDPOINTS.VERIFICATION.STATUS);
        setVerificationStatus(res.data.status);
      } catch {
        setVerificationStatus(null);
      }
    })();
  }, []);

  const savePrivacySettings = useCallback(
    async (updates: { is_discoverable?: boolean; show_distance?: DistanceOption }) => {
      setSavingSettings(true);
      try {
        await put(ENDPOINTS.SETTINGS, updates);
        addToast({ message: "Settings saved", type: "success" });
      } catch {
        addToast({ message: "Failed to save settings", type: "error" });
      } finally {
        setSavingSettings(false);
      }
    },
    [addToast]
  );

  const handleToggleDiscoverable = () => {
    const newValue = !isDiscoverable;
    setIsDiscoverable(newValue);
    savePrivacySettings({ is_discoverable: newValue });
  };

  const handleCycleDistance = () => {
    const currentIndex = DISTANCE_OPTIONS.indexOf(showDistance);
    const nextIndex = (currentIndex + 1) % DISTANCE_OPTIONS.length;
    const newValue = DISTANCE_OPTIONS[nextIndex];
    setShowDistance(newValue);
    savePrivacySettings({ show_distance: newValue });
  };

  const handleSavePreferences = async () => {
    try {
      await put(ENDPOINTS.USERS.PREFERENCES, {
        age_min: ageMin,
        age_max: ageMax,
        proximity_range: maxDistance,
        interested_in: interestedIn,
      });
      addToast({ message: "Preferences saved", type: "success" });
    } catch {
      addToast({ message: "Failed to save", type: "error" });
    }
  };

  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    try {
      await post(ENDPOINTS.VERIFICATION.REQUEST, {});
      setVerificationStatus("pending");
      addToast({ message: "Verification requested!", type: "success" });
    } catch {
      addToast({ message: "Failed to request verification", type: "error" });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.replace("/");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "InBlood",
          text: "Check out InBlood - Where Hearts Connect! Find your perfect match.",
          url: "https://inblood.app",
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText("https://inblood.app");
      addToast({ message: "Link copied to clipboard!", type: "success" });
    }
  };

  const interestedInOptions = ["man", "woman", "non-binary", "everyone"];

  return (
    <div className="h-full flex flex-col">
      <Header title="Settings">
        {savingSettings && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
      </Header>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
        {/* Account */}
        <SettingsSection title="Account">
          <SettingsCard>
            <SettingsItem
              icon={<User className="w-[18px] h-[18px]" />}
              label="Edit Profile"
              subtitle="Update your photos and info"
              onClick={() => router.push("/profile/edit")}
            />
            <SettingsItem
              icon={<Crown className="w-[18px] h-[18px] text-superlike" />}
              label="Premium"
              subtitle="Unlock all features"
              onClick={() => router.push("/premium")}
              iconBg="bg-superlike/10"
            />
            <SettingsItem
              icon={<Ban className="w-[18px] h-[18px]" />}
              label="Blocked Users"
              subtitle="Manage blocked accounts"
              onClick={() => router.push("/settings/blocked")}
              isLast
            />
          </SettingsCard>
        </SettingsSection>

        {/* Verification */}
        <SettingsSection title="Verification">
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  {profile?.is_verified ? "Verified" : "Get Verified"}
                </p>
                <p className="text-xs text-white/30 leading-relaxed">
                  {profile?.is_verified
                    ? "Your profile is verified. The blue badge is visible on your profile."
                    : verificationStatus === "pending"
                    ? "Your verification request is being reviewed. This usually takes 24-48 hours."
                    : "Verify your identity to get a blue badge on your profile. This helps build trust with your matches."}
                </p>
              </div>
            </div>
            {!profile?.is_verified && verificationStatus !== "pending" && (
              <div className="flex justify-center">
                <button
                  onClick={handleRequestVerification}
                  disabled={isRequestingVerification}
                  className="px-8 py-2.5 bg-info/10 hover:bg-info/15 text-info text-sm rounded-full transition-all flex items-center justify-center gap-2 border border-info/20"
                >
                  {isRequestingVerification ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Requesting...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Request Verification</>
                  )}
                </button>
              </div>
            )}
            {verificationStatus === "pending" && (
              <div className="flex justify-center">
                <div className="px-8 py-2.5 bg-warning/10 text-warning text-sm rounded-full text-center border border-warning/20">
                  Pending Review
                </div>
              </div>
            )}
            {profile?.is_verified && (
              <div className="flex justify-center">
                <div className="px-8 py-2.5 bg-success/10 text-success text-sm rounded-full text-center border border-success/20">
                  Verified
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsCard>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <EyeOff className="w-[18px] h-[18px] text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Incognito Mode</p>
                <p className="text-xs text-white/25 mt-0.5">
                  {isDiscoverable ? "Your profile is visible" : "Your profile is hidden"}
                </p>
              </div>
              <button
                onClick={handleToggleDiscoverable}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  !isDiscoverable ? "bg-primary" : "bg-white/[0.08]"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5"
                  style={{ transform: `translateX(${!isDiscoverable ? "22px" : "2px"})` }}
                />
              </button>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={handleCycleDistance}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-[18px] h-[18px] text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Show Distance</p>
                <p className="text-xs text-white/25 mt-0.5">{DISTANCE_LABELS[showDistance]}</p>
              </div>
              <span className="px-2.5 py-1 bg-primary/15 rounded-md text-xs font-medium text-primary">
                {DISTANCE_BADGE[showDistance]}
              </span>
            </div>
            <SettingsItem
              icon={<Ban className="w-[18px] h-[18px]" />}
              label="Blocked Users"
              subtitle="Manage blocked accounts"
              onClick={() => router.push("/settings/blocked")}
              isLast
            />
          </SettingsCard>
        </SettingsSection>

        {/* Discovery Preferences */}
        <SettingsSection title="Discovery Preferences">
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-3">Interested in</p>
              <div className="flex flex-wrap gap-2">
                {interestedInOptions.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                    selected={interestedIn.includes(opt)}
                    onClick={() =>
                      setInterestedIn((prev) =>
                        prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]
                      )
                    }
                    variant="outline"
                    size="sm"
                  />
                ))}
              </div>
            </div>
            <Slider label="Min Age" min={18} max={99} value={ageMin} onChange={setAgeMin} />
            <Slider label="Max Age" min={18} max={99} value={ageMax} onChange={setAgeMax} />
            <Slider label="Max Distance" min={1} max={100} value={maxDistance} onChange={setMaxDistance} suffix=" km" />
            <div className="flex justify-center">
              <button
                onClick={handleSavePreferences}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsCard>
            <SettingsItem
              icon={<Bell className="w-[18px] h-[18px]" />}
              label="Push Notifications"
              subtitle="Managed through browser settings"
              onClick={() => addToast({ message: "Check your browser notification settings", type: "info" })}
              isLast
            />
          </SettingsCard>
        </SettingsSection>

        {/* Help & Support */}
        <SettingsSection title="Help & Support">
          <SettingsCard>
            <SettingsItem
              icon={<HelpCircle className="w-[18px] h-[18px]" />}
              label="Help Center"
              subtitle="Safety tips & contact support"
              onClick={() => addToast({ message: "Help center coming soon", type: "info" })}
            />
            <SettingsItem
              icon={<ShieldCheck className="w-[18px] h-[18px]" />}
              label="Safety Tips"
              onClick={() => addToast({ message: "Safety tips coming soon", type: "info" })}
            />
            <SettingsItem
              icon={<FileText className="w-[18px] h-[18px]" />}
              label="Terms & Privacy Policy"
              onClick={() => addToast({ message: "Terms page coming soon", type: "info" })}
              isLast
            />
          </SettingsCard>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsCard>
            <SettingsItem
              icon={<Info className="w-[18px] h-[18px]" />}
              label="App Version"
              subtitle="1.0.0"
              noChevron
            />
            <SettingsItem
              icon={<Star className="w-[18px] h-[18px]" />}
              label="Rate Us"
              subtitle="Love InBlood? Leave a review!"
              onClick={() => addToast({ message: "Rating feature coming soon!", type: "info" })}
            />
            <SettingsItem
              icon={<Share2 className="w-[18px] h-[18px]" />}
              label="Share InBlood"
              subtitle="Invite friends to join"
              onClick={handleShare}
              isLast
            />
          </SettingsCard>
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account Actions">
          <SettingsCard>
            <SettingsItem
              icon={<LogOut className="w-[18px] h-[18px]" />}
              label="Logout"
              onClick={() => setShowLogoutConfirm(true)}
              danger
              isLast
            />
          </SettingsCard>
        </SettingsSection>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-white/15">Made with love by InBlood Team</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative w-full max-w-sm mx-4 bg-[#1a1a1a] rounded-2xl border border-white/[0.08] p-6 text-center">
            <h3 className="text-lg font-medium text-white mb-2">Logout</h3>
            <p className="text-sm text-white/40 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm rounded-xl hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-error/15 border border-error/30 text-error text-sm rounded-xl hover:bg-error/25 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────────────────────

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pt-5 pb-1">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3 px-1">{title}</h3>
      {children}
    </div>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">{children}</div>
  );
}

function SettingsItem({
  icon,
  label,
  subtitle,
  onClick,
  isLast = false,
  danger = false,
  noChevron = false,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  isLast?: boolean;
  danger?: boolean;
  noChevron?: boolean;
  iconBg?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 text-left ${
        onClick ? "hover:bg-white/[0.02] cursor-pointer" : ""
      } transition-colors ${!isLast ? "border-b border-white/[0.06]" : ""}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg || (danger ? "bg-error/10" : "bg-primary/10")}`}>
        <span className={danger ? "text-error" : "text-primary"}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-error" : "text-white"}`}>{label}</p>
        {subtitle && <p className="text-xs text-white/25 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {!noChevron && onClick && <ChevronRight className="w-4 h-4 text-white/15 shrink-0" />}
    </Tag>
  );
}
