"use client";

import { useUIStore } from "@/stores/ui.store";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-info/30 bg-info/10 text-info",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl",
                colorMap[toast.type]
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium text-white flex-1">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
