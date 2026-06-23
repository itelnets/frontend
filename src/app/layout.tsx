import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-3',
            style: {
              maxWidth: '90vw',
              fontSize: '14px'
            }
          }}
        />
        <Navbar />
        <main className="min-h-[calc(100vh-5rem)] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
