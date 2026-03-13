"use client";

import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

interface ChipProps {
  label: string;
  variant?: "default" | "primary" | "outline";
  size?: "sm" | "md";
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function Chip({
  label,
  variant = "default",
  size = "md",
  removable,
  onRemove,
  onClick,
  selected,
  className,
}: ChipProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200",
        {
          "bg-card-light text-text-secondary": variant === "default" && !selected,
          "bg-primary/15 text-primary border border-primary/30":
            variant === "primary" || selected,
          "border border-border text-text-secondary hover:border-primary hover:text-primary":
            variant === "outline" && !selected,
        },
        {
          "px-2.5 py-1 text-xs": size === "sm",
          "px-3.5 py-1.5 text-sm": size === "md",
        },
        onClick && "cursor-pointer",
        className
      )}
    >
      {label}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
