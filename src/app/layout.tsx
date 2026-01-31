import type { Metadata } from "next";
import { Inter, Playfair_Display, Nunito_Sans } from "next/font/google";
import "./main.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { BookingProvider } from "@/context/BookingContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-serif',
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Winterstone | Alpine Luxury",
  description: "A luxury escape in the Himalayas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${nunito.variable} font-sans antialiased`}>
        <AuthProvider>
          <EventProvider>
            <EmployeeProvider>
              <BookingProvider> {/* Added BookingProvider */}
                <Navbar />
                {children}
                <Footer />
                <Toaster position="bottom-right" /> {/* Modified Toaster position */}
              </BookingProvider> {/* Closed BookingProvider */}
            </EmployeeProvider>
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}