"use client";

import { cn } from "@/lib/utils/cn";

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  suffix?: string;
  className?: string;
}

export default function Slider({
  min,
  max,
  value,
  onChange,
  label,
  showValue = true,
  suffix = "",
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-3">
          {label && (
            <span className="text-sm text-white/50">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-white tabular-nums">
              {value}
              {suffix}
            </span>
          )}
        </div>
      )}
      <div className="relative h-1.5">
        <div className="absolute inset-0 rounded-full bg-white/[0.08]" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-black/30 pointer-events-none ring-2 ring-primary"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
