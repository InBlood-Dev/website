"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Avatar from "@/components/ui/Avatar";
import { X, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { formatLastActive } from "@/lib/utils/formatters";
import type { StoryUser } from "@/lib/api/types";

interface StoryViewerProps {
  storyUsers: StoryUser[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({
  storyUsers,
  initialIndex,
  onClose,
}: StoryViewerProps) {
  const [userIndex, setUserIndex] = useState(initialIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentUser = storyUsers[userIndex];
  const currentStory = currentUser?.stories[storyIndex];

  // Mark as viewed
  useEffect(() => {
    if (currentStory && !currentStory.has_viewed) {
      post(ENDPOINTS.STORIES.VIEW(currentStory.story_id)).catch(() => {});
    }
  }, [currentStory]);

  // Auto-advance timer
  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        goNext();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [userIndex, storyIndex]);

  const goNext = useCallback(() => {
    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
    } else if (userIndex < storyUsers.length - 1) {
      setUserIndex((prev) => prev + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [storyIndex, userIndex, currentUser, storyUsers.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
    } else if (userIndex > 0) {
      setUserIndex((prev) => prev - 1);
      const prevUser = storyUsers[userIndex - 1];
      setStoryIndex(prevUser.stories.length - 1);
    }
  }, [storyIndex, userIndex, storyUsers]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story content */}
      <div className="relative w-full max-w-[420px] aspect-[9/16] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${userIndex}-${storyIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {currentStory.media_type === "video" ? (
              <video
                src={currentStory.media_url}
                className="w-full h-full object-cover rounded-2xl"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <Image
                src={currentStory.media_url}
                alt="Story"
                fill
                className="object-cover rounded-2xl"
                sizes="420px"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {currentUser.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width:
                    i < storyIndex
                      ? "100%"
                      : i === storyIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User info */}
        <div className="absolute top-8 left-3 right-3 z-20 flex items-center gap-2">
          <Avatar
            src={currentUser.user_photo}
            alt={currentUser.user_name}
            size="sm"
          />
          <span className="text-white text-sm font-semibold">
            {currentUser.user_name}
          </span>
          {currentUser.is_verified && (
            <BadgeCheck className="w-4 h-4 text-info" />
          )}
          <span className="text-white/60 text-xs">
            {formatLastActive(currentStory.created_at)}
          </span>
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-6 left-3 right-3 z-20">
            <p className="text-white text-sm bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Touch zones */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
        />
        <button
          onClick={goNext}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
        />
      </div>

      {/* Desktop nav arrows */}
      {userIndex > 0 && (
        <button
          onClick={goPrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 items-center justify-center text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {(storyIndex < currentUser.stories.length - 1 ||
        userIndex < storyUsers.length - 1) && (
        <button
          onClick={goNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 items-center justify-center text-white hover:bg-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
