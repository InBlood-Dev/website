"use client";

import { cn } from "@/lib/utils/cn";
import { BadgeCheck } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  isVerified?: boolean;
  className?: string;
  borderColor?: string;
}

const sizeMap = {
  xs: "w-8 h-8",
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const onlineDotSize = {
  xs: "w-2 h-2",
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
  xl: "w-4 h-4",
};

export default function Avatar({
  src,
  alt,
  size = "md",
  isOnline,
  isVerified,
  className,
  borderColor,
}: AvatarProps) {
  return (
    <div
      className={cn("relative inline-flex shrink-0", borderColor ? "p-[3px]" : "", className)}
    >
      <div
        className={cn("rounded-full overflow-hidden bg-white/[0.06]", sizeMap[size])}
        style={borderColor ? { outline: `2px solid ${borderColor}`, outlineOffset: "1px" } : undefined}
      >
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-top block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-lg font-bold">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {isOnline && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-success border-2 border-background",
            onlineDotSize[size]
          )}
        />
      )}

      {isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <BadgeCheck className="w-4 h-4 text-info fill-info/20" />
        </div>
      )}
    </div>
  );
}
