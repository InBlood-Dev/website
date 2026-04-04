"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api/endpoints";

interface LegalLink {
  slug: string;
  title: string;
}

const KNOWN_ROUTES: Record<string, string> = {
  "privacy-policy": "/privacy",
  "terms-of-service": "/terms",
  "cookie-policy": "/cookie-policy",
  "safety-tips": "/safety-tips",
  "community-guidelines": "/community-guidelines",
};

const FALLBACK_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Community Guidelines", href: "/community-guidelines" },
  { label: "Safety Tips", href: "/safety-tips" },
];

export default function LegalPoliciesGrid() {
  const [links, setLinks] = useState(FALLBACK_LINKS);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch(`${API_BASE_URL}/legal`);
        if (!res.ok) return;
        const json = await res.json();
        const pages: LegalLink[] = json.data;
        setLinks(
          pages.map((p) => ({
            label: p.title,
            href: KNOWN_ROUTES[p.slug] || `/legal/${p.slug}`,
          }))
        );
      } catch {
        // keep fallback
      }
    }
    fetchLinks();
  }, []);

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="flex items-center justify-between px-5 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 group"
        >
          <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">
            {link.label}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/20 group-hover:text-white/50 transition-colors"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ))}
    </>
  );
}
