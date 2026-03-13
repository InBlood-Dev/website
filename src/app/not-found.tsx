import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <Image src="/logo.png" alt="InBlood" width={80} height={80} className="rounded-3xl mx-auto mb-6" />
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <p className="text-white/40 text-lg mb-8">
          This page doesn't exist. Maybe your match is somewhere else?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-full text-white font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
