"use client";

import Image from "next/image";
import Link from "next/link";
import LegalPoliciesGrid from "@/components/legal/LegalPoliciesGrid";

export default function SupportPage() {
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
            <span className="text-sm tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}><span className="text-primary">in</span><span className="text-white">Blood</span></span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-3">Support</h1>
        <p className="text-white/40 text-lg mb-12">
          We're here to help. Reach out to us or find answers below.
        </p>

        {/* Contact */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6">Contact Us</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:followinblood@gmail.com"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Email Support</p>
                <p className="text-white/40 text-sm">followinblood@gmail.com</p>
              </div>
            </a>

            <a
              href="https://wa.me/919900000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">WhatsApp</p>
                <p className="text-white/40 text-sm">Chat with us directly</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I create an account?",
                a: "Download the InBlood app from Google Play Store or Apple App Store, open it, and sign up using your Google account or phone number. Follow the onboarding steps to set up your profile.",
              },
              {
                q: "How do I reset my password?",
                a: "InBlood uses Google Sign-In and phone-based authentication, so there is no separate password to reset. If you're having trouble signing in, try signing in with the same method you originally used.",
              },
              {
                q: "How do I edit my profile?",
                a: "Go to your Profile tab, tap the edit icon, and update your photos, bio, interests, and preferences. Changes are saved automatically.",
              },
              {
                q: "How does matching work?",
                a: "InBlood shows you profiles based on your preferences (age, distance, interests). Swipe right to like someone. If they like you back, it's a match and you can start chatting.",
              },
              {
                q: "How do I report or block a user?",
                a: "Open the user's profile, tap the menu icon (three dots), and select 'Report' or 'Block'. Our team reviews all reports and takes action within 24 hours.",
              },
              {
                q: "How do I delete my account?",
                a: "Go to Settings > Account > Delete Account. This will permanently remove your profile, matches, and messages. This action cannot be undone.",
              },
              {
                q: "Is my data safe?",
                a: "Yes. We take privacy seriously. Your data is encrypted and stored securely. We never sell your personal information. Read our Privacy Policy for full details.",
              },
              {
                q: "What is InBlood Premium?",
                a: "InBlood Premium unlocks features like unlimited likes, advanced filters, seeing who liked you, and priority profile visibility. You can subscribe from the Premium tab in the app.",
              },
            ].map(({ q, a }, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm hover:bg-white/[0.03] transition-colors">
                  {q}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/30 shrink-0 ml-4 transition-transform group-open:rotate-180"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-white/40 text-sm leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Policies */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6">Policies & Guidelines</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <LegalPoliciesGrid />
          </div>
        </section>

        {/* Response time */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
          <p className="text-white/50 text-sm">
            We typically respond within <span className="text-white font-semibold">24 hours</span>. For urgent safety concerns, please use the in-app report feature for fastest response.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/15 tracking-wider">
            &copy; {new Date().getFullYear()} InBlood. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/legal" className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
              Legal
            </Link>
            <Link href="/" className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
