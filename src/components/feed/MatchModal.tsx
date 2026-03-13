"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            className="text-center max-w-sm"
          >
            {/* Hearts animation */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6"
            >
              <Heart className="w-16 h-16 text-primary mx-auto fill-primary" />
            </motion.div>

            <h1 className="text-4xl font-black gradient-text mb-2">
              It's a Match!
            </h1>
            <p className="text-text-secondary text-lg mb-8">
              You and {userName} liked each other
            </p>

            {/* User photo */}
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-8 ring-4 ring-primary shadow-2xl shadow-primary/30">
              <Image
                src={userPhoto}
                alt={userName}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={onMessage} size="lg" fullWidth>
                <MessageCircle className="w-5 h-5 mr-2" />
                Send a Message
              </Button>
              <Button onClick={onClose} variant="secondary" size="lg" fullWidth>
                Keep Swiping
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
