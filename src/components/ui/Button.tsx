"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          {
            "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20":
              variant === "primary",
            "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]":
              variant === "secondary",
            "bg-transparent hover:bg-white/[0.06] text-white/50 hover:text-white":
              variant === "ghost",
            "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20":
              variant === "danger",
            "border border-white/[0.1] hover:border-white/[0.2] text-white bg-transparent hover:bg-white/[0.04]":
              variant === "outline",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-sm": size === "md",
            "px-8 py-4 text-[15px]": size === "lg",
            "px-10 py-5 text-lg": size === "xl",
          },
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
