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

const siteUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pratham Herbs | The Wellness store",
    template: "%s | Pratham Herbs",
  },
  description: "Shop 100% pure Ayurvedic medicines, herbal powders, and holistic wellness supplements online. Consult certified Ayurvedic doctors for free and enjoy fast pan-India delivery.",
  keywords: [
    "Pratham Herbs",
    "Ayurvedic Products",
    "Herbal Medicines",
    "Natural Health Supplements",
    "Ayurveda Store",
    "Herbal Wellness",
    "Doctor Consultation",
    "Ayurvedic Healthcare",
    "The Wellness Store",
  ],
  authors: [{ name: "Pratham Herbs", url: siteUrl }],
  creator: "Pratham Herbs",
  publisher: "Pratham Herbs",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand-logo.png', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/brand-logo.png',
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
    title: 'Pratham Herbs | The Wellness store',
    description: 'Shop 100% pure Ayurvedic medicines, herbal powders, and holistic wellness supplements online. Consult certified Ayurvedic doctors for free and enjoy fast pan-India delivery.',
    images: [
      {
        url: `${siteUrl}/brand-logo.png`,
        width: 910,
        height: 956,
        alt: 'Pratham Herbs Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pratham Herbs | The Wellness store',
    description: 'Shop 100% pure Ayurvedic medicines, herbal powders, and holistic wellness supplements online. Consult certified Ayurvedic doctors for free and enjoy fast pan-India delivery.',
    images: [`${siteUrl}/brand-logo.png`],
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
    alternateName: ['PrathamHerbs', 'Pratham Herbs - The Wellness Store'],
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pratham Herbs',
    url: siteUrl,
    logo: `${siteUrl}/brand-logo.png`,
    image: `${siteUrl}/brand-logo.png`,
    description: 'Shop 100% pure Ayurvedic medicines, herbal powders, and holistic wellness supplements online. Consult certified Ayurvedic doctors for free and enjoy fast pan-India delivery.',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-9558688770',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'gu'],
      },
    ],
    sameAs: [
      'https://wa.me/9558688770',
    ],
  };

  const jsonLdNavigation = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'All Products',
        description: 'Explore 100% authentic Ayurvedic and herbal formulations.',
        url: `${siteUrl}/products`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Supplements & Nutrition',
        description: 'Premium daily herbal supplements and natural wellness formulas.',
        url: `${siteUrl}/products?category=Supplements`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Ayurvedic Products',
        description: 'Authentic traditional Ayurvedic medicines and herbal remedies.',
        url: `${siteUrl}/type/Ayurvedic`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Dr. Corner',
        description: 'Free doctor consultation with experienced Ayurvedic practitioners.',
        url: `${siteUrl}/doctor-corner`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 5,
        name: 'My Account & Orders',
        description: 'Track your orders, view order history, and manage your account.',
        url: `${siteUrl}/login`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 6,
        name: 'Terms & Conditions',
        description: 'Authenticity guarantee, 15 days return policy, and terms.',
        url: `${siteUrl}/user/terms-and-conditions`,
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/brand-logo.png" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNavigation) }}
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
