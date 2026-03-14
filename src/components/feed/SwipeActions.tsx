"use client";

import { motion } from "framer-motion";
import { X, Heart, Star, Undo2 } from "lucide-react";

interface SwipeActionsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onUndo?: () => void;
  disabled?: boolean;
  canUndo?: boolean;
}

export default function SwipeActions({
  onPass,
  onLike,
  onSuperLike,
  onUndo,
  disabled = false,
  canUndo = false,
}: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Undo */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.15] transition-all disabled:opacity-20 shadow-lg shadow-black/20"
      >
        <Undo2 className="w-5 h-5 text-amber-400" />
      </motion.button>

      {/* Pass */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onPass}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.15] transition-all disabled:opacity-40 shadow-lg shadow-black/20"
      >
        <X className="w-7 h-7 text-white/50" />
      </motion.button>

      {/* Like */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onLike}
        disabled={disabled}
        className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center disabled:opacity-40 shadow-xl shadow-primary/30 hover:shadow-primary/45 transition-shadow"
      >
        <Heart className="w-8 h-8 text-white" />
      </motion.button>

      {/* Super Like */}
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
