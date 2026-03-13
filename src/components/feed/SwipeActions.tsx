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
    <div className="flex items-center justify-center gap-6">
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onPass}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.15] transition-all disabled:opacity-40 shadow-lg shadow-black/20"
      >
        <X className="w-7 h-7 text-white/50" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onLike}
        disabled={disabled}
        className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center disabled:opacity-40 shadow-xl shadow-primary/30 hover:shadow-primary/45 transition-shadow"
      >
        <Heart className="w-8 h-8 text-white" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onSuperLike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-superlike/[0.08] border border-superlike/20 flex items-center justify-center hover:bg-superlike/[0.15] hover:border-superlike/35 transition-all disabled:opacity-40 shadow-lg shadow-black/20"
      >
        <Star className="w-6 h-6 text-superlike" />
      </motion.button>
    </div>
  );
}
