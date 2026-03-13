import { create } from "zustand";
import type { MatchToastData } from "@/lib/api/types";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  matchModal: MatchToastData | null;
  toasts: Toast[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showMatchModal: (data: MatchToastData) => void;
  hideMatchModal: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  sidebarCollapsed: false,
  matchModal: null,
  toasts: [],

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  showMatchModal: (data) => {
    set({ matchModal: data });
  },

  hideMatchModal: () => {
    set({ matchModal: null });
  },

  addToast: (toast) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
