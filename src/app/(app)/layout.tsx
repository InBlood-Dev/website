"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import ToastContainer from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
      <ToastContainer />
    </AuthGuard>
  );
}
