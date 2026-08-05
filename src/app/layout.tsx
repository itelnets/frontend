import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomToaster from '@/components/CustomToaster';
import MaintenanceModal from '@/components/MaintenanceModal';
import GlobalHealthCheck from '@/components/GlobalHealthCheck';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Itelents Admin",
  description: "Itelents Administration Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip max-w-full">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col overflow-x-clip w-full max-w-full`}>
        <CustomToaster />
        <GlobalHealthCheck />
        <MaintenanceModal />
        {children}
      </body>
    </html>
  );
}
