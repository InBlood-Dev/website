"use client";

import { useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import Chip from "@/components/ui/Chip";
import {
  MapPin,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { RecommendedUser } from "@/lib/api/types";

interface SwipeCardProps {
  user: RecommendedUser;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop?: boolean;
}

export default function SwipeCard({ user, onSwipe, isTop = false }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  const superLikeOpacity = useTransform(y, [-100, 0], [1, 0]);

  const photos: string[] = (user.photos && user.photos.length > 0) ? user.photos : user.primary_photo ? [user.primary_photo] : [];

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const xThreshold = 120;
      const yThreshold = -100;

      if (info.offset.y < yThreshold && Math.abs(info.offset.x) < 80) {
        onSwipe("up");
      } else if (info.offset.x > xThreshold) {
        onSwipe("right");
      } else if (info.offset.x < -xThreshold) {
        onSwipe("left");
      }
    },
    [onSwipe]
  );

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => Math.min(prev + 1, photos.length - 1));
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <motion.div
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate }}
      whileDrag={{ cursor: "grabbing" }}
      className={cn(
        "absolute w-full max-w-[400px] aspect-[3/4.5] rounded-2xl overflow-hidden select-none",
        isTop ? "cursor-grab z-10" : "z-0 scale-[0.97] opacity-60"
      )}
    >
      {/* Photo */}
      <div className="absolute inset-0 bg-white/[0.04]">
        {photos[photoIndex] ? (
          <Image
            src={photos[photoIndex]}
            alt={user.name}
            fill
            className="object-cover"
            priority={isTop}
            sizes="400px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-white/20">{user.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Photo navigation dots */}
      {photos.length > 1 && (
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {photos.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                i === photoIndex ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Photo prev/next zones */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
          />
          <button
            onClick={nextPhoto}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
          />
        </>
      )}

      {/* Swipe indicators */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 z-20 px-4 py-2 border-4 border-success rounded-xl rotate-[-15deg]"
          >
            <span className="text-success text-3xl font-black">LIKE</span>
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-8 right-6 z-20 px-4 py-2 border-4 border-error rounded-xl rotate-[15deg]"
          >
            <span className="text-error text-3xl font-black">NOPE</span>
          </motion.div>
          <motion.div
            style={{ opacity: superLikeOpacity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 px-4 py-2 border-4 border-superlike rounded-xl"
          >
            <span className="text-superlike text-3xl font-black">
              SUPER LIKE
            </span>
          </motion.div>
        </>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* User info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-2xl font-medium text-white tracking-tight">
            {user.name}, {user.age}
          </h3>
          {user.is_verified && (
            <BadgeCheck className="w-5 h-5 text-info fill-info/20" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-white/40 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {user.location_city}
            {user.distance > 0 && ` · ${Math.round(user.distance)} km`}
          </span>
        </div>

        {user.bio && (
          <p className="text-white/80 text-sm line-clamp-2 mb-3">
            {user.bio}
          </p>
        )}

        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.tags.slice(0, 4).map((tag, i) => (
              <Chip key={i} label={typeof tag === "string" ? tag : tag.name} size="sm" />
            ))}
          </div>
        )}

        {/* Relationship types */}
        {user.relationship_types && user.relationship_types.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {user.relationship_types.map((rt, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: rt.border_color,
                  color: rt.border_color,
                }}
              >
                {rt.type}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
