"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, Compass, Heart, MessageCircle, User } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home, isCenter: false },
  { href: "/discover", label: "Discover", icon: Compass, isCenter: false },
  { href: "/feed", label: "", icon: Heart, isCenter: true },
  { href: "/matches", label: "Matches", icon: MessageCircle, isCenter: false },
  { href: "/profile", label: "Profile", icon: User, isCenter: false },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      <div className="mx-4 mb-3 rounded-full bg-background/90 backdrop-blur-2xl border border-white/[0.06] shadow-lg shadow-black/30">
        <div className="flex items-center justify-around h-16 relative">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-5"
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isActive
                        ? "bg-primary shadow-primary/40"
                        : "bg-primary shadow-primary/25"
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 transition-all relative",
                  isActive ? "text-white" : "text-white/30"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-colors", isActive && "text-primary")} />
                <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-white" : "text-white/30")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
