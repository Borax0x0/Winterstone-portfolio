import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Winterstone Lodge",
  description: "Hotel Policy, Terms & Conditions, and Refund & Cancellation Policy for Winterstone Lodge, Manali.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">

        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold tracking-widest text-stone-400 hover:text-white mb-10 uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">Terms & Conditions</h1>
        <p className="text-stone-500 text-sm mb-12">Last updated: April 2026 · Winterstone Lodge, Manali, Himachal Pradesh, India</p>

        <div className="space-y-10">

          {/* Hotel Policy */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-6">Hotel Policy</h2>

            <div className="space-y-6">
              <PolicyItem title="Tariff">
                All published room charges are exclusive of applicable taxes (currently 12% GST) and any additional services availed during the stay. Guests are encouraged to contact the front desk or Duty Manager for a detailed breakdown of charges before confirming their reservation.
              </PolicyItem>

              <PolicyItem title="Bill Settlement">
                All outstanding bills must be settled in full at the time of check-out or upon presentation. Payment is accepted via UPI, debit/credit cards, and online bank transfers. Personal cheques are not accepted.
              </PolicyItem>

              <PolicyItem title="Check-In">
                <ul className="space-y-1 mt-1">
                  <li>Standard check-in time is <strong className="text-white">2:00 PM</strong> (subject to change; confirmed at time of booking).</li>
                  <li>Guests must present a valid government-issued photo identification (Aadhaar, Passport, Driving Licence, or Voter ID) at the time of check-in for verification purposes, as required under local regulations.</li>
                  <li>Early check-in is subject to availability and may incur additional charges.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Check-Out">
                <ul className="space-y-1 mt-1">
                  <li>Standard check-out time is <strong className="text-white">11:00 AM</strong> (subject to change; confirmed at time of booking).</li>
                  <li>Rooms must be vacated by the designated check-out time. Late check-out is subject to availability and may attract additional charges.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Luggage & Belongings">
                <ul className="space-y-1 mt-1">
                  <li>Management reserves the right to retain or auction guest belongings in the event of unpaid dues.</li>
                  <li>Luggage storage services are provided at the guest&apos;s own risk and are limited to a maximum of <strong className="text-white">30 days</strong> from the date of check-out. Unclaimed luggage after this period may be disposed of at the management&apos;s discretion.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Valuables & Safe Custody">
                <ul className="space-y-1 mt-1">
                  <li>Guests are advised to secure valuables in the lockers or safe custody facilities provided by the hotel.</li>
                  <li>Valuables left in rooms or suites are the sole responsibility of the guest. The management is not responsible for any loss, theft, or damage to personal belongings left unsecured.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Pets">
                Pets are not permitted on the premises.
              </PolicyItem>

              <PolicyItem title="Prohibited Items & Activities">
                Hazardous goods, contraband, illegal substances, weapons, and gambling activities are strictly prohibited on hotel premises. Violation may result in immediate eviction and reporting to local authorities.
              </PolicyItem>

              <PolicyItem title="Property Damage">
                <ul className="space-y-1 mt-1">
                  <li>Guests will be held liable for any damage to hotel property, furnishings, or equipment caused by themselves or their visitors.</li>
                  <li>Damaged or broken items will incur charges at up to <strong className="text-white">three times their market value</strong>, as assessed by the management.</li>
                  <li>Guests are prohibited from affixing labels, stickers, markings, or any adhesive materials to walls, furniture, or fixtures. Charges for resulting damages will apply.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Guest Conduct">
                Guests are expected to maintain appropriate decorum and respect for fellow guests and staff at all times. The management reserves the right to evict, without refund, any guest engaging in disruptive, offensive, or disrespectful behaviour.
              </PolicyItem>

              <PolicyItem title="Tenancy Rights">
                A hotel booking constitutes a licence to occupy, not a lease. Guests do not acquire tenancy rights of any nature; the management retains full control and authority over the premises at all times.
              </PolicyItem>

              <PolicyItem title="Visitors">
                Visitors are not permitted in guest rooms without prior permission from the reception desk. Unregistered visitors may incur additional charges.
              </PolicyItem>

              <PolicyItem title="Laundry">
                Laundry services, where available, must be used for washing clothes. In-room washing or drying of clothes is not permitted.
              </PolicyItem>

              <PolicyItem title="Outside Food & Beverages">
                Outside food and beverages are not permitted inside the hotel premises.
              </PolicyItem>

              <PolicyItem title="Compliance">
                All guests must adhere to applicable Indian laws, local regulations, and hotel rules during their stay. The management is authorised to take appropriate action, including contacting law enforcement, in the event of any illegal or improper use of hotel premises.
              </PolicyItem>
            </div>
          </section>

          <hr className="border-stone-800" />

          {/* Terms & Conditions */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-6">Booking Terms</h2>
            <div className="space-y-6">

              <PolicyItem title="Acceptance">
                By making a reservation through the Winterstone Lodge website (thewinterstonestudio.com), or by checking in to the property, guests agree to be bound by these Terms & Conditions, the Hotel Policy, and the Privacy Policy as stated herein.
              </PolicyItem>

              <PolicyItem title="Reservations & Booking">
                <ul className="space-y-1 mt-1">
                  <li>Reservations are confirmed only upon successful payment of the booking amount through the website&apos;s payment gateway.</li>
                  <li>Room allotment is subject to availability at the time of booking.</li>
                  <li>Room tariffs are dynamic and may change without prior notice. The rate applicable at the time of confirmed booking will be honoured for that reservation.</li>
                  <li>The management reserves the right to refuse or cancel a booking at its discretion, in which case a full refund of any amount paid will be processed.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Pricing & Taxes">
                <ul className="space-y-1 mt-1">
                  <li>All room rates displayed on the website are base rates per night.</li>
                  <li>Applicable taxes (currently <strong className="text-white">12% GST</strong>) are calculated and displayed separately during the booking process.</li>
                  <li>Add-on services and experience packages, where selected, are charged in addition to the room rate and are inclusive in the tax calculation.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Payment">
                <ul className="space-y-1 mt-1">
                  <li>Payments are processed securely through <strong className="text-white">Razorpay</strong>, a PCI-DSS compliant payment gateway. Winterstone Lodge does not store credit/debit card details on its servers.</li>
                  <li>In the event of a payment failure, no booking is created and no amount is charged.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Limitation of Liability">
                <ul className="space-y-1 mt-1">
                  <li>The hotel shall not be liable for any indirect, incidental, or consequential loss arising from the guest&apos;s stay, including but not limited to loss of personal belongings, data, or business opportunities.</li>
                  <li>The hotel&apos;s total liability for any claim shall not exceed the total booking amount paid by the guest for the relevant reservation.</li>
                </ul>
              </PolicyItem>

              <PolicyItem title="Governing Law & Jurisdiction">
                All disputes arising from or related to these Terms & Conditions shall be governed by the laws of India and shall be subject to the exclusive jurisdiction of the courts in Kullu.
              </PolicyItem>

            </div>
          </section>

          <hr className="border-stone-800" />

          {/* Refund & Cancellation */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-6">Refund & Cancellation Policy</h2>
            <div className="space-y-4 text-stone-400 leading-relaxed">
              <ul className="space-y-3">
                <li>Guests may cancel their reservation by contacting the hotel via email or phone.</li>
                <li>The refund timeline typically takes <strong className="text-white">1 to 7 business days</strong> once a guest cancels their reservation.</li>
                <li>Refunds will be credited to the original payment method used during booking.</li>
                <li>Advance payments are non-refundable under certain circumstances.</li>
                <li>Booking modifications (date changes, room upgrades) are subject to availability and may result in a revised tariff. Requests for modification should be made by contacting the hotel directly.</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer Nav */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex gap-6 text-xs uppercase tracking-widest text-stone-500">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}

function PolicyItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <div className="text-stone-400 leading-relaxed text-sm">{children}</div>
    </div>
  );
}
