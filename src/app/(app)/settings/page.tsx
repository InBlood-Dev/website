"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { useUIStore } from "@/stores/ui.store";
import { put, post, get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import Chip from "@/components/ui/Chip";
import {
  User,
  Shield,
  Ban,
  Crown,
  LogOut,
  ChevronRight,
  Eye,
  Clock,
  BadgeCheck,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const addToast = useUIStore((s) => s.addToast);

  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [showDistance, setShowDistance] = useState<"exact" | "approximate" | "hide">("exact");
  const [showLastActive, setShowLastActive] = useState(true);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [maxDistance, setMaxDistance] = useState(50);
  const [interestedIn, setInterestedIn] = useState<string[]>(["everyone"]);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

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

  // Check verification status
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

  const handleSavePreferences = async () => {
    try {
      const body = {
        age_min: ageMin,
        age_max: ageMax,
        proximity_range: maxDistance,
        interested_in: interestedIn,
      };
      await put(ENDPOINTS.USERS.PREFERENCES, body);
      addToast({ message: "Preferences saved", type: "success" });
    } catch {
      addToast({ message: "Failed to save", type: "error" });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await put(ENDPOINTS.SETTINGS, {
        is_discoverable: isDiscoverable,
        show_distance: showDistance,
        show_last_active: showLastActive,
      });
      addToast({ message: "Settings saved", type: "success" });
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
    await logout();
    router.replace("/login");
  };

  const interestedInOptions = ["man", "woman", "non-binary", "everyone"];

  return (
    <div className="h-full flex flex-col">
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto">
        {/* Account section */}
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3 px-1">
            Account
          </h3>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
            <SettingsItem
              icon={<User className="w-[18px] h-[18px]" />}
              label="Edit Profile"
              onClick={() => router.push("/profile/edit")}
            />
            <SettingsItem
              icon={<Crown className="w-[18px] h-[18px] text-superlike" />}
              label="Premium"
              onClick={() => router.push("/premium")}
            />
            <SettingsItem
              icon={<Ban className="w-[18px] h-[18px]" />}
              label="Blocked Users"
              onClick={() => router.push("/settings/blocked")}
              isLast
            />
          </div>
        </div>

        {/* Verification section */}
        <div className="px-5 py-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3 px-1">
            Verification
          </h3>
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Request Verification
                  </>
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
        </div>

        {/* Discovery preferences */}
        <div className="px-5 py-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3 px-1">
            Discovery Preferences
          </h3>
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
            <Slider
              label="Min Age"
              min={18}
              max={100}
              value={ageMin}
              onChange={setAgeMin}
            />
            <Slider
              label="Max Age"
              min={18}
              max={99}
              value={ageMax}
              onChange={setAgeMax}
            />
            <Slider
              label="Max Distance"
              min={1}
              max={100}
              value={maxDistance}
              onChange={setMaxDistance}
              suffix=" km"
            />
            <div className="flex justify-center">
              <button
                onClick={handleSavePreferences}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="px-5 py-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3 px-1">
            Privacy
          </h3>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
            <ToggleItem
              icon={<Eye className="w-[18px] h-[18px]" />}
              label="Discoverable"
              description="Show your profile to others"
              value={isDiscoverable}
              onChange={setIsDiscoverable}
            />
            <ToggleItem
              icon={<Clock className="w-[18px] h-[18px]" />}
              label="Show Last Active"
              description="Let others see when you were last online"
              value={showLastActive}
              onChange={setShowLastActive}
              isLast
            />
          </div>
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleSaveSettings}
              className="px-8 py-2.5 border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all text-sm rounded-full tracking-wide"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 pt-3 pb-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="px-8 py-2.5 border border-primary/30 text-primary hover:bg-primary/10 transition-all text-sm rounded-full tracking-wide flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({
  icon,
  label,
  onClick,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isLast?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/[0.03] transition-colors ${
        !isLast ? "border-b border-white/[0.06]" : ""
      }`}
    >
      <span className="text-white/40">{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-white">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-white/20" />
    </button>
  );
}

function ToggleItem({
  icon,
  label,
  description,
  value,
  onChange,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        !isLast ? "border-b border-white/[0.06]" : ""
      }`}
    >
      <span className="text-white/40">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/25 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? "bg-primary" : "bg-white/[0.08]"
        }`}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5"
          style={{ transform: `translateX(${value ? "22px" : "2px"})` }}
        />
      </button>
    </div>
  );
}
