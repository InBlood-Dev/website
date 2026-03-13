"use client";

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
  Flame,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/feed", label: "Feed", icon: Flame },
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
        "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-white tracking-tight">
            InBlood
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-card-light hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar
            src={profilePicture}
            alt={name || "User"}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {name || "User"}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-card-light text-text-muted hover:text-error transition-colors"
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
        className="flex items-center justify-center h-10 border-t border-border text-text-muted hover:text-white hover:bg-card-light transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
