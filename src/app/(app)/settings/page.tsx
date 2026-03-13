"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { useUIStore } from "@/stores/ui.store";
import { put, get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import {
  User,
  Shield,
  Ban,
  Crown,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  MapPin,
  Clock,
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

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setAgeMin(profile.preference_age_min || profile.age_min || 18);
      setAgeMax(profile.preference_age_max || profile.age_max || 35);
      setMaxDistance(profile.preference_max_distance || profile.proximity_range || 50);
    }
  }, [profile]);

  const handleSavePreferences = async () => {
    try {
      await put(ENDPOINTS.USERS.PREFERENCES, {
        age_min: ageMin,
        age_max: ageMax,
        max_distance: maxDistance,
      });
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

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto">
        {/* Account section */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
            Account
          </h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <SettingsItem
              icon={<User className="w-5 h-5" />}
              label="Edit Profile"
              onClick={() => router.push("/profile/edit")}
            />
            <SettingsItem
              icon={<Shield className="w-5 h-5" />}
              label="Verification"
              onClick={() => {}}
            />
            <SettingsItem
              icon={<Crown className="w-5 h-5 text-superlike" />}
              label="Premium"
              onClick={() => router.push("/premium")}
            />
            <SettingsItem
              icon={<Ban className="w-5 h-5" />}
              label="Blocked Users"
              onClick={() => router.push("/settings/blocked")}
              isLast
            />
          </div>
        </div>

        {/* Discovery preferences */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
            Discovery Preferences
          </h3>
          <div className="bg-card rounded-xl border border-border p-4 space-y-6">
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
              max={100}
              value={ageMax}
              onChange={setAgeMax}
            />
            <Slider
              label="Max Distance"
              min={1}
              max={200}
              value={maxDistance}
              onChange={setMaxDistance}
              suffix=" km"
            />
            <Button onClick={handleSavePreferences} size="sm" fullWidth>
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Privacy */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
            Privacy
          </h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <ToggleItem
              icon={<Eye className="w-5 h-5" />}
              label="Discoverable"
              description="Show your profile to others"
              value={isDiscoverable}
              onChange={setIsDiscoverable}
            />
            <ToggleItem
              icon={<Clock className="w-5 h-5" />}
              label="Show Last Active"
              description="Let others see when you were last online"
              value={showLastActive}
              onChange={setShowLastActive}
              isLast
            />
          </div>
          <div className="mt-3">
            <Button onClick={handleSaveSettings} size="sm" variant="secondary" fullWidth>
              Save Privacy Settings
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 pb-8">
          <Button
            onClick={handleLogout}
            variant="danger"
            fullWidth
            size="lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
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
      className={`flex items-center gap-3 w-full px-4 py-3.5 hover:bg-card-light transition-colors ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-white">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-text-muted" />
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
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <span className="text-text-secondary">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors ${
          value ? "bg-primary" : "bg-card-light"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-5.5" : "translate-x-0.5"
          }`}
          style={{ transform: `translateX(${value ? "22px" : "2px"})` }}
        />
      </button>
    </div>
  );
}
