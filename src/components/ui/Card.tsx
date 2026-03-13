"use client";

import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  className,
  variant = "default",
  hover = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        {
          "bg-white/[0.04]": variant === "default",
          "glass": variant === "glass",
          "bg-white/[0.04] border border-white/[0.08]": variant === "bordered",
        },
        hover && "hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer",
        {
          "p-0": padding === "none",
          "p-3": padding === "sm",
          "p-5": padding === "md",
          "p-7": padding === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
