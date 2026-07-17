import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from 'react-hot-toast';
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Itelents",
  description: "Premium Ayurvedic Products",
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <WhatsAppButton />
    </CartProvider>
  );
}
