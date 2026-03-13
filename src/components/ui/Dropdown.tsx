"use client";

import { cn } from "@/lib/utils/cn";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("w-full", className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3",
          "text-left transition-colors duration-200",
          isOpen && "border-primary ring-1 ring-primary"
        )}
      >
        <span className={selected ? "text-white" : "text-text-muted"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm transition-colors",
                option.value === value
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-card-light hover:text-white"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
