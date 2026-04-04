import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/lib/analytics/posthog";
import { ClarityScript } from "@/lib/analytics/clarity";

export const metadata: Metadata = {
  title: "InBlood — Find Your Match",
  description:
    "InBlood is a modern dating platform that helps you find meaningful connections. Swipe, match, and chat with people near you.",
  keywords: ["dating", "matches", "connections", "InBlood"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "InBlood — Find Your Match",
    description:
      "A modern dating platform that helps you find meaningful connections.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased bg-background text-foreground"
      >
        <ClarityScript />
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
