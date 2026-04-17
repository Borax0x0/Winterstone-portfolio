import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Winterstone Lodge",
  description: "Privacy Policy and Terms & Conditions for Winterstone Lodge, Manali.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">

        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold tracking-widest text-stone-400 hover:text-white mb-10 uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">Privacy Policy</h1>
        <p className="text-stone-500 text-sm mb-12">Last updated: April 2026 · Winterstone Lodge, Manali, Himachal Pradesh, India</p>

        <div className="prose prose-invert prose-stone max-w-none space-y-10">

          {/* Information We Collect */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">Information We Collect</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              When you make a reservation or create an account on our website, we may collect the following personal information:
            </p>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-white font-medium">Identity Data:</span> Full name</li>
              <li><span className="text-white font-medium">Contact Data:</span> Email address, phone number</li>
              <li><span className="text-white font-medium">Booking Data:</span> Check-in/check-out dates, room preferences, special requests, add-on selections</li>
              <li><span className="text-white font-medium">Payment Data:</span> Transaction references and payment confirmation details. Card details are processed directly by Razorpay and are never stored on our servers.</li>
              <li><span className="text-white font-medium">Account Data:</span> If you create an account or sign in via Google, we store your name, email, and login preferences</li>
              <li><span className="text-white font-medium">Technical Data:</span> Browser type, IP address, and cookies necessary for website functionality and session management</li>
            </ul>
          </section>

          <hr className="border-stone-800" />

          {/* How We Use Your Information */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">How We Use Your Information</h2>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-white font-medium">Reservations:</span> To process, confirm, and manage your booking</li>
              <li><span className="text-white font-medium">Communication:</span> To send booking confirmations, check-in instructions, and respond to your enquiries</li>
              <li><span className="text-white font-medium">Guest Services:</span> To fulfil special requests and personalise your stay experience</li>
              <li><span className="text-white font-medium">Marketing (with consent):</span> With your explicit consent, we may send promotional offers, surveys, or newsletters. You may opt out at any time.</li>
              <li><span className="text-white font-medium">Operations:</span> Anonymised and aggregated data may be used to analyse booking trends and improve our services</li>
            </ul>
          </section>

          <hr className="border-stone-800" />

          {/* Data Sharing */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">Data Sharing</h2>
            <p className="text-stone-400 leading-relaxed mb-4">We share personal data only in the following circumstances:</p>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-white font-medium">Payment Processing:</span> With Razorpay, our payment gateway, to process transactions securely</li>
              <li><span className="text-white font-medium">Channel Management:</span> Booking details may be shared with our channel manager (eZee/Yanolja Cloud) to synchronise room availability across booking platforms and prevent double-bookings</li>
              <li><span className="text-white font-medium">Legal Compliance:</span> When required by law, regulation, court order, or a request from a government authority</li>
              <li>We <span className="text-white font-medium">do not</span> sell or share your personal data with third parties for their independent marketing purposes without your explicit consent</li>
            </ul>
          </section>

          <hr className="border-stone-800" />

          {/* Cookies & Authentication */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">Cookies & Authentication</h2>
            <ul className="space-y-2 text-stone-400">
              <li>Our website uses cookies to manage user sessions (login state) and enhance your browsing experience.</li>
              <li>If you choose to sign in via Google, the authentication is handled through Google&apos;s OAuth service. We receive only your name and email address; we do not access your Google password or other Google account data.</li>
            </ul>
          </section>

          <hr className="border-stone-800" />

          {/* Data Security */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">Data Security</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              We implement reasonable technical and organisational measures to protect your personal information, including:
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Access controls restricting data access to authorised personnel only</li>
              <li>Secure database hosting with established cloud providers</li>
            </ul>
            <p className="text-stone-400 leading-relaxed mt-4">
              No method of electronic transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <hr className="border-stone-800" />

          {/* Data Retention */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">Data Retention</h2>
            <ul className="space-y-2 text-stone-400">
              <li>Personal data is retained only for as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law.</li>
              <li>Booking records may be retained for accounting and legal compliance purposes as required under Indian tax and hospitality regulations.</li>
              <li>You may request deletion of your personal data by contacting us at the email address below, subject to any legal retention obligations.</li>
            </ul>
          </section>

          <hr className="border-stone-800" />

          {/* Your Rights */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-4">Your Rights</h2>
            <p className="text-stone-400 leading-relaxed mb-4">You have the right to:</p>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-white font-medium">Access</span> the personal data we hold about you</li>
              <li><span className="text-white font-medium">Correct</span> inaccurate or incomplete data</li>
              <li><span className="text-white font-medium">Delete</span> your data (subject to legal retention requirements)</li>
              <li><span className="text-white font-medium">Withdraw consent</span> for marketing communications at any time</li>
            </ul>
            <p className="text-stone-400 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at:{" "}
              <a href="mailto:thewinterstoneofficial@gmail.com" className="text-[#D4AF37] hover:underline">
                thewinterstoneofficial@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Footer Nav */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex gap-6 text-xs uppercase tracking-widest text-stone-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}
