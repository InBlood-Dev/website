"use client";

import { cn } from "@/lib/utils/cn";
import { Flame } from "lucide-react";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Header({ title, children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="md:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Flame className="w-4 h-4 text-white" />
        </div>
        {title && <h1 className="text-lg font-bold text-white">{title}</h1>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
