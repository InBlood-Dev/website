"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Compass, MessageCircle, Heart, User } from "lucide-react";

const navItems = [
  { href: "/feed", label: "Feed", icon: null },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/likes", label: "Likes", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl safe-area-inset-bottom">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
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
                "flex flex-col items-center gap-1 px-3 py-2 transition-all relative",
                isActive ? "text-white" : "text-white/20"
              )}
            >
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-gradient-to-r from-primary to-primary-light" />
              )}
              {Icon ? (
                <Icon className={cn("w-5 h-5 transition-colors", isActive && "text-primary")} />
              ) : (
                <div className="relative w-5 h-5">
                  {isActive && <div className="absolute inset-0 rounded-sm bg-primary/30 blur-[3px]" />}
                  <Image src="/logo.png" alt="InBlood" width={20} height={20} className="relative rounded-sm" />
                </div>
              )}
              <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-white" : "text-white/20")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
