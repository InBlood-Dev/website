"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden"
          >
            {i < current && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
