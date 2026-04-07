"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api/endpoints";

interface LegalListItem {
  slug: string;
  title: string;
  is_active?: boolean;
}

interface LegalDoc {
  slug: string;
  title: string;
  content: string;
  last_updated: string | null;
}

function LegalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docParam = searchParams.get("doc");

  const [list, setList] = useState<LegalListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(false);

  // Fetch list once
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/legal`);
        if (!res.ok) throw new Error("failed");
        const json = await res.json();
        if (!cancelled) setList(json.data || []);
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Determine which slug to show
  const selectedSlug =
    docParam ||
    list.find((p) => p.is_active)?.slug ||
    list[0]?.slug ||
    null;

  // Fetch the selected doc
  useEffect(() => {
    if (!selectedSlug) return;
    let cancelled = false;
    setDocLoading(true);
    setDocError(false);
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/legal/${selectedSlug}`);
        if (!res.ok) throw new Error("not found");
        const json = await res.json();
        if (!cancelled) setDoc(json.data);
      } catch {
        if (!cancelled) {
          setDoc(null);
          setDocError(true);
        }
      } finally {
        if (!cancelled) setDocLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  function selectDoc(slug: string) {
    router.replace(`/legal?doc=${slug}`, { scroll: false });
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="InBlood"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-neutral-900">InBlood</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full md:w-72 md:border-r border-neutral-200 md:min-h-full p-4 md:p-6 bg-neutral-50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4 px-3">
            Legal Documents
          </h2>
          {listLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 bg-neutral-200/60 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-neutral-500 px-3">
              No legal documents available.
            </p>
          ) : (
            <ul className="space-y-1">
              {list.map((item) => {
                const isSelected = item.slug === selectedSlug;
                return (
                  <li key={item.slug}>
                    <button
                      onClick={() => selectDoc(item.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? "bg-neutral-900 text-white font-medium"
                          : "text-neutral-700 hover:bg-neutral-200/70"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>{item.title}</span>
                        {item.is_active && (
                          <span
                            className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            Active
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 md:p-12 max-w-4xl">
          {docLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 w-64 bg-neutral-200 rounded-lg" />
              <div className="h-4 w-40 bg-neutral-100 rounded" />
              <div className="mt-8 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-neutral-100 rounded"
                    style={{ width: `${70 + Math.random() * 30}%` }}
                  />
                ))}
              </div>
            </div>
          ) : docError || !doc ? (
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
                Document not available
              </h1>
              <p className="text-neutral-500">
                Select a document from the left to read it.
              </p>
            </div>
          ) : (
            <article>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-3">
                {doc.title}
              </h1>
              {doc.last_updated && (
                <p className="text-neutral-500 text-sm mb-8">
                  Last updated:{" "}
                  {new Date(doc.last_updated).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              <div
                className="legal-content legal-content-light text-neutral-700 space-y-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
            </article>
          )}
        </main>
      </div>
    </div>
  );
}

export default function LegalHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white" />
      }
    >
      <LegalPageInner />
    </Suspense>
  );
}
