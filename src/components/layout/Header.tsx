"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Header({ title, children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "relative flex items-center justify-between h-14 px-5 md:px-8 bg-background/60 backdrop-blur-2xl sticky top-0 z-40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center md:hidden">
          <div className="absolute inset-0 rounded-full bg-primary/25 blur-[8px]" />
          <Image src="/logo.png" alt="InBlood" width={28} height={28} className="relative z-10 rounded-lg object-contain" />
        </div>
        {title && <h1 className="text-[13px] font-medium text-white uppercase tracking-[0.15em]">{title}</h1>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
      {/* Gradient bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </header>
  );
}
