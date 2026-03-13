"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">InBlood</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-6">
          Terms of Service
        </h1>
        <div className="text-text-secondary space-y-6 leading-relaxed">
          <p>Last updated: March 2026</p>

          <h2 className="text-xl font-bold text-white pt-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By using InBlood, you agree to these Terms of Service. If you do not
            agree, please do not use our platform.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            2. Eligibility
          </h2>
          <p>
            You must be at least 18 years old to use InBlood. By creating an
            account, you confirm that you meet this age requirement.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            3. Account Responsibilities
          </h2>
          <p>
            You are responsible for maintaining the security of your account and
            for all activities that occur under your account. You agree to
            provide accurate information and not impersonate others.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            4. Community Guidelines
          </h2>
          <p>
            You agree to treat others with respect. Harassment, hate speech,
            spam, scams, and inappropriate content are prohibited and may result
            in account suspension.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            5. Premium Subscriptions
          </h2>
          <p>
            Premium subscriptions are billed according to the plan selected.
            Refunds are handled on a case-by-case basis. You can cancel your
            subscription at any time.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            6. Limitation of Liability
          </h2>
          <p>
            InBlood is provided "as is". We do not guarantee that you will find
            a match. We are not liable for interactions between users.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            7. Contact
          </h2>
          <p>
            For questions about these terms, contact us at legal@inblood.app.
          </p>
        </div>
      </main>
    </div>
  );
}
