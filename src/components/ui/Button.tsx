"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
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
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20":
              variant === "primary",
            "bg-card hover:bg-card-light text-white border border-border":
              variant === "secondary",
            "bg-transparent hover:bg-card text-text-secondary hover:text-white":
              variant === "ghost",
            "bg-error/10 hover:bg-error/20 text-error border border-error/20":
              variant === "danger",
            "border border-border hover:border-primary text-white bg-transparent":
              variant === "outline",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-7 py-3.5 text-lg": size === "lg",
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
