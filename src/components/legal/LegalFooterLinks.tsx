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
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Safety Tips", href: "/safety-tips" },
  { label: "Community Guidelines", href: "/community-guidelines" },
];

export default function LegalFooterLinks() {
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
        <li key={link.label}>
          <Link
            href={link.href}
            className="text-white/35 text-[13px] hover:text-white transition-colors duration-300 font-light"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </>
  );
}
