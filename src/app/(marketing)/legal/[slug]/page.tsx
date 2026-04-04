"use client";

import { useParams } from "next/navigation";
import LegalPageContent from "@/components/legal/LegalPageContent";

export default function DynamicLegalPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Convert slug to a readable fallback title (e.g., "tes-anil" → "Tes Anil")
  const fallbackTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return <LegalPageContent slug={slug} fallbackTitle={fallbackTitle} />;
}
