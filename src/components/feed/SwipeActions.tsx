"use client";

import { motion } from "framer-motion";
import { X, Heart, Star } from "lucide-react";

interface SwipeActionsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
}

export default function SwipeActions({
  onPass,
  onLike,
  onSuperLike,
  disabled = false,
}: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onPass}
        disabled={disabled}
        className="w-14 h-14 rounded-full border-2 border-pass flex items-center justify-center bg-card hover:bg-pass/10 transition-colors disabled:opacity-50"
      >
        <X className="w-7 h-7 text-pass" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        disabled={disabled}
        className="w-12 h-12 rounded-full border-2 border-superlike flex items-center justify-center bg-card hover:bg-superlike/10 transition-colors disabled:opacity-50"
      >
        <Star className="w-6 h-6 text-superlike" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        disabled={disabled}
        className="w-14 h-14 rounded-full border-2 border-like flex items-center justify-center bg-card hover:bg-like/10 transition-colors disabled:opacity-50"
      >
        <Heart className="w-7 h-7 text-like" />
      </motion.button>
    </div>
  );
}
