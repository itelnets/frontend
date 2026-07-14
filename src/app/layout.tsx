import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { CartProvider } from "@/context/CartContext";

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
    <html lang="en" className="overflow-x-hidden max-w-full">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col overflow-x-hidden w-full max-w-full`}>
        <CartProvider>
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
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
