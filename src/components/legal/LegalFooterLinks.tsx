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
  const [activeDoc, setActiveDoc] = useState<LegalLink | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLinks() {
      try {
        const res = await fetch(`${API_BASE_URL}/legal`);
        if (!res.ok) return;
        const json = await res.json();
        const pages: LegalLink[] = json.data || [];
        const active = pages.find((p) => p.is_active) || null;
        if (!cancelled) setActiveDoc(active);
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
      {activeDoc && (
        <li>
          <Link
            href={`/legal?doc=${activeDoc.slug}`}
            className="text-white/60 text-[13px] hover:text-white transition-colors duration-300 font-medium"
          >
            {activeDoc.title}
          </Link>
        </li>
      )}
    </>
  );
}
