"use client";

import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/[0.06]",
        {
          "rounded-md h-4": variant === "text",
          "rounded-full": variant === "circular",
          "rounded-xl": variant === "rectangular",
        },
        className
      )}
      style={{ width, height }}
    />
  );
}
