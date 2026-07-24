import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomToaster from '@/components/CustomToaster';

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
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col overflow-x-clip w-full max-w-full`}>
        <CustomToaster />
        {children}
      </body>
    </html>
  );
}
