"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Flame, Compass, MessageCircle, Heart, User } from "lucide-react";

const navItems = [
  { href: "/feed", label: "Feed", icon: Flame },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/likes", label: "Likes", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-text-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
