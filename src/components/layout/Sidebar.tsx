"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import Avatar from "@/components/ui/Avatar";
import {
  Heart,
  Compass,
  MessageCircle,
  User,
  Settings,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/feed", label: "Feed", icon: null },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/likes", label: "Likes", icon: Heart },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { name, profilePicture, logout } = useAuthStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-background/60 backdrop-blur-2xl transition-all duration-300 shrink-0 relative",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Right border gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 relative">
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-[8px]" />
          <Image src="/logo.png" alt="InBlood" width={26} height={26} className="relative z-10 rounded-lg object-contain" />
        </div>
        {!collapsed && (
          <span className="text-sm font-medium text-white tracking-tight">
            InBlood
          </span>
        )}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                isActive
                  ? "text-white bg-white/[0.06]"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary to-primary-light" />
              )}
              {Icon ? (
                <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-white/50")} />
              ) : (
                <div className="relative w-[18px] h-[18px] shrink-0">
                  {isActive && <div className="absolute inset-0 rounded-sm bg-primary/30 blur-[4px]" />}
                  <Image src="/logo.png" alt="InBlood" width={18} height={18} className="relative rounded-sm" />
                </div>
              )}
              {!collapsed && (
                <span className="text-[13px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="flex items-center gap-3 px-2 py-2 mt-1">
          <Avatar
            src={profilePicture}
            alt={name || "User"}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">
                {name || "User"}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-white/15 hover:text-primary transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 text-white/15 hover:text-white/40 transition-colors relative"
      >
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
