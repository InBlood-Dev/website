import Link from "next/link";
import { Flame } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-card mx-auto mb-6 flex items-center justify-center border border-border">
          <Flame className="w-10 h-10 text-text-muted" />
        </div>
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <p className="text-text-secondary text-lg mb-8">
          This page doesn't exist. Maybe your match is somewhere else?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
