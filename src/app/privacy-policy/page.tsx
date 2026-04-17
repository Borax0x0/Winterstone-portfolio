import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Winterstone Lodge",
  description: "Privacy Policy for Winterstone Lodge, Manali. How we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-stone-700 pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">

        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold tracking-widest text-stone-400 hover:text-stone-900 mb-10 uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-stone-400 text-sm mb-12">Last updated: April 2026 · Winterstone Lodge, Manali, Himachal Pradesh, India</p>

        <div className="space-y-10 text-[15px] leading-relaxed">

          {/* Information We Collect */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">Information We Collect</h2>
            <p className="mb-4">
              When you make a reservation or create an account on our website, we may collect the following personal information:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-stone-900">Identity Data:</strong> Full name</li>
              <li><strong className="text-stone-900">Contact Data:</strong> Email address, phone number</li>
              <li><strong className="text-stone-900">Booking Data:</strong> Check-in/check-out dates, room preferences, special requests, add-on selections</li>
              <li><strong className="text-stone-900">Payment Data:</strong> Transaction references and payment confirmation details. Card details are processed directly by Razorpay and are never stored on our servers.</li>
              <li><strong className="text-stone-900">Account Data:</strong> If you create an account or sign in via Google, we store your name, email, and login preferences</li>
              <li><strong className="text-stone-900">Technical Data:</strong> Browser type, IP address, and cookies necessary for website functionality and session management</li>
            </ul>
          </section>

          <hr className="border-stone-200" />

          {/* How We Use Your Information */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">How We Use Your Information</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-stone-900">Reservations:</strong> To process, confirm, and manage your booking</li>
              <li><strong className="text-stone-900">Communication:</strong> To send booking confirmations, check-in instructions, and respond to your enquiries</li>
              <li><strong className="text-stone-900">Guest Services:</strong> To fulfil special requests and personalise your stay experience</li>
              <li><strong className="text-stone-900">Marketing (with consent):</strong> With your explicit consent, we may send promotional offers, surveys, or newsletters. You may opt out at any time.</li>
              <li><strong className="text-stone-900">Operations:</strong> Anonymised and aggregated data may be used to analyse booking trends and improve our services</li>
            </ul>
          </section>

          <hr className="border-stone-200" />

          {/* Data Sharing */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">Data Sharing</h2>
            <p className="mb-4">We share personal data only in the following circumstances:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-stone-900">Payment Processing:</strong> With Razorpay, our payment gateway, to process transactions securely</li>
              <li><strong className="text-stone-900">Channel Management:</strong> Booking details may be shared with our channel manager (eZee/Yanolja Cloud) to synchronise room availability across booking platforms and prevent double-bookings</li>
              <li><strong className="text-stone-900">Legal Compliance:</strong> When required by law, regulation, court order, or a request from a government authority</li>
              <li>We <strong className="text-stone-900">do not</strong> sell or share your personal data with third parties for their independent marketing purposes without your explicit consent</li>
            </ul>
          </section>

          <hr className="border-stone-200" />

          {/* Cookies & Authentication */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">Cookies & Authentication</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Our website uses cookies to manage user sessions (login state) and enhance your browsing experience.</li>
              <li>If you choose to sign in via Google, the authentication is handled through Google&apos;s OAuth service. We receive only your name and email address; we do not access your Google password or other Google account data.</li>
            </ul>
          </section>

          <hr className="border-stone-200" />

          {/* Data Security */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">Data Security</h2>
            <p className="mb-4">
              We implement reasonable technical and organisational measures to protect your personal information, including:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Access controls restricting data access to authorised personnel only</li>
              <li>Secure database hosting with established cloud providers</li>
            </ul>
            <p className="mt-4">
              No method of electronic transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <hr className="border-stone-200" />

          {/* Data Retention */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">Data Retention</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Personal data is retained only for as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law.</li>
              <li>Booking records may be retained for accounting and legal compliance purposes as required under Indian tax and hospitality regulations.</li>
              <li>You may request deletion of your personal data by contacting us at the email address below, subject to any legal retention obligations.</li>
            </ul>
          </section>

          <hr className="border-stone-200" />

          {/* Your Rights */}
          <section>
            <h2 className="font-serif text-xl text-stone-900 mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-stone-900">Access</strong> the personal data we hold about you</li>
              <li><strong className="text-stone-900">Correct</strong> inaccurate or incomplete data</li>
              <li><strong className="text-stone-900">Delete</strong> your data (subject to legal retention requirements)</li>
              <li><strong className="text-stone-900">Withdraw consent</strong> for marketing communications at any time</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us at:{" "}
              <a href="mailto:thewinterstoneofficial@gmail.com" className="text-[#D4AF37] hover:underline">
                thewinterstoneofficial@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Footer Nav */}
        <div className="mt-16 pt-8 border-t border-stone-200 flex gap-6 text-xs uppercase tracking-widest text-stone-400">
          <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms & Conditions</Link>
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}
