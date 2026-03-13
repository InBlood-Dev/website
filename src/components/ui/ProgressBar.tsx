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
  const percentage = (current / total) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-card-light overflow-hidden"
          >
            {i < current && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.3 }}
                className="h-full bg-primary rounded-full"
              />
            )}
            {i === current && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(percentage % (100 / total)) * total}%` }}
                className="h-full bg-primary/50 rounded-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
