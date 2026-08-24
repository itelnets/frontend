import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import CustomToaster from '@/components/CustomToaster';
import MaintenanceModal from '@/components/MaintenanceModal';
import CookieConsentModal from '@/components/CookieConsentModal';

import { CartProvider } from "@/context/CartContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Itelents",
  description: "Premium Ayurvedic Products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`} suppressHydrationWarning>
        <CartProvider>
          <CustomToaster />
          <MaintenanceModal />
          <CookieConsentModal />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
