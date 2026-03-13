"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  userName: string;
  userPhoto: string;
  conversationId: string;
  onClose: () => void;
  onMessage: () => void;
}

export default function MatchModal({
  isOpen,
  userName,
  userPhoto,
  onClose,
  onMessage,
}: MatchModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-background/95" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            className="text-center max-w-sm relative z-10"
          >
            {/* Animated heart with glow */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="mb-8 relative"
            >
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-primary/20 blur-[25px]" />
              <Heart className="w-20 h-20 text-primary mx-auto fill-primary relative z-10 drop-shadow-lg" />
            </motion.div>

            <h1 className="text-5xl font-light text-white mb-3 tracking-tight">
              It&apos;s a <span className="gradient-text font-medium">Match!</span>
            </h1>
            <p className="text-white/30 text-[15px] mb-10">
              You and {userName} liked each other
            </p>

            {/* User photo with gradient ring */}
            <div className="relative w-36 h-36 mx-auto mb-12">
              <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-primary to-primary-light opacity-60" />
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src={userPhoto}
                  alt={userName}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onMessage}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow flex items-center justify-center gap-2.5"
              >
                <MessageCircle className="w-4 h-4" />
                Send a Message
              </motion.button>
              <button
                onClick={onClose}
                className="w-full py-4 text-white/30 text-sm hover:text-white/50 transition-colors"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
