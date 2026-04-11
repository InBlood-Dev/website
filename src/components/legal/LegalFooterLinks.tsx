"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api/endpoints";

interface LegalLink {
  slug: string;
  title: string;
  is_active?: boolean;
}

export default function LegalFooterLinks() {
  const [activeDocs, setActiveDocs] = useState<LegalLink[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchLinks() {
      try {
        const res = await fetch(`${API_BASE_URL}/legal`);
        if (!res.ok) return;
        const json = await res.json();
        const pages: LegalLink[] = json.data || [];
        if (!cancelled) setActiveDocs(pages.filter((p) => p.is_active));
      } catch {
        // ignore
      }
    }
    fetchLinks();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <li>
        <Link
          href="/legal"
          className="text-white/35 text-[13px] hover:text-white transition-colors duration-300 font-light"
        >
          Legal
        </Link>
      </li>
      {activeDocs.map((doc) => (
        <li key={doc.slug}>
          <Link
            href={`/legal?doc=${doc.slug}`}
            className="text-white/60 text-[13px] hover:text-white transition-colors duration-300 font-medium"
          >
            {doc.title}
          </Link>
        </li>
      ))}
    </>
  );
}
