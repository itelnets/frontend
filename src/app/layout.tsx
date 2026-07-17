import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

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
        <Toaster
          position="top-center"
          toastOptions={{

            className: '!text-[13px] sm:!text-[15px] !px-2.5 !py-2 sm:!px-3 sm:!py-2.5 max-w-[90vw] sm:!max-w-fit sm:whitespace-nowrap [&>div:first-child]:!mr-1.5 sm:[&>div:first-child]:!mr-3 [&>div:first-child]:scale-90 sm:[&>div:first-child]:scale-110 [&>div[role="status"]]:!m-0'
          }}
        />
        {children}
      </body>
    </html>
  );
}
