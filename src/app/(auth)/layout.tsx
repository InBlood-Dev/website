"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Image panel - hidden on mobile */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <Image
          src="/images/about-couple1.jpg"
          alt="InBlood"
          fill
          className="object-cover scale-105"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-4">InBlood</p>
          <p className="text-3xl font-light text-white leading-tight tracking-tight">
            Where real connections begin.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        {children}
      </div>
    </div>
  );
}
