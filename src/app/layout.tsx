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

const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || '';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pratham Herbs - Premium Ayurvedic & Herbal Products",
    template: "%s | Pratham Herbs",
  },
  description: "Discover authentic Ayurvedic medicines, herbal supplements, wellness products, and doctor consultations at Pratham Herbs. 100% Pure & Natural.",
  keywords: [
    "Pratham Herbs",
    "Ayurvedic Products",
    "Herbal Medicines",
    "Natural Health Supplements",
    "Ayurveda Store",
    "Herbal Wellness",
    "Doctor Consultation",
    "Ayurvedic Healthcare",
  ],
  authors: [{ name: "Pratham Herbs", url: siteUrl }],
  creator: "Pratham Herbs",
  publisher: "Pratham Herbs",
  icons: {
    icon: [
      { url: '/brand_logo.png', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/brand_logo.png',
    apple: '/brand_logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Pratham Herbs',
    title: 'Pratham Herbs - Premium Ayurvedic & Herbal Products',
    description: 'Discover authentic Ayurvedic medicines, herbal supplements, and wellness products at Pratham Herbs.',
    images: [
      {
        url: `${siteUrl}/brand_logo.png`,
        width: 800,
        height: 600,
        alt: 'Pratham Herbs Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pratham Herbs - Premium Ayurvedic & Herbal Products',
    description: 'Discover authentic Ayurvedic medicines, herbal supplements, and wellness products at Pratham Herbs.',
    images: [`${siteUrl}/brand_logo.png`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pratham Herbs',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pratham Herbs',
    url: siteUrl,
    logo: `${siteUrl}/brand_logo.png`,
    sameAs: [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand_logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/brand_logo.png" />
        {/* <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> */}
        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
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
