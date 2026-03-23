"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api/endpoints";

interface LegalPageData {
  slug: string;
  title: string;
  content: string;
  last_updated: string | null;
}

export default function LegalPageContent({
  slug,
  fallbackTitle,
}: {
  slug: string;
  fallbackTitle: string;
}) {
  const [page, setPage] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`${API_BASE_URL}/legal/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setPage(json.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="InBlood"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-white">InBlood</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-64 bg-white/[0.06] rounded-lg" />
            <div className="h-4 w-40 bg-white/[0.04] rounded" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-white/[0.04] rounded"
                  style={{ width: `${70 + Math.random() * 30}%` }}
                />
              ))}
            </div>
          </div>
        ) : error || !page ? (
          <div>
            <h1 className="text-4xl font-black text-white mb-6">
              {fallbackTitle}
            </h1>
            <p className="text-white/50">
              This page is currently being updated. Please check back later.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl font-black text-white mb-4">
              {page.title}
            </h1>
            {page.last_updated && (
              <p className="text-white/30 text-sm mb-8">
                Last updated:{" "}
                {new Date(page.last_updated).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            <div
              className="legal-content text-white/50 space-y-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
