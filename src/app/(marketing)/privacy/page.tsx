"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="InBlood" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-white">InBlood</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-6">Privacy Policy</h1>
        <div className="text-white/50 space-y-6 leading-relaxed">
          <p>Last updated: March 2026</p>

          <h2 className="text-xl font-bold text-white pt-4">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, including your
            name, age, gender, photos, bio, location, and preferences. We also
            collect usage data such as swipe activity, messages, and device
            information.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to provide and improve our services, match
            you with compatible users, enable communication, ensure safety, and
            personalize your experience.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            3. Information Sharing
          </h2>
          <p>
            We do not sell your personal information. Your profile information is
            visible to other users. We share data with service providers who
            assist in operating our platform (cloud hosting, payment processing).
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            4. Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            data, including encryption in transit and at rest, secure
            authentication, and regular security audits.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            5. Your Rights
          </h2>
          <p>
            You can access, update, or delete your profile data at any time
            through the app settings. You can request a full data export or
            account deletion by contacting our support team.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">
            6. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at privacy@inblood.app.
          </p>
        </div>
      </main>
    </div>
  );
}
