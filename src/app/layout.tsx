import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QRWolf - Free QR Code Generator with Analytics & Tracking",
    template: "%s | QRWolf",
  },
  description: "Create professional QR codes in seconds. Free QR code generator with custom colors, logos, dynamic URLs, and real-time scan analytics. Perfect for restaurants, marketing, business cards, and events.",
  applicationName: "QRWolf",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  keywords: [
    "qr code generator",
    "free qr code",
    "qr code maker",
    "dynamic qr code",
    "qr code with logo",
    "qr code tracking",
    "qr code analytics",
    "wifi qr code",
    "menu qr code",
    "vcard qr code",
    "restaurant qr code",
    "business qr code",
    "qr code creator",
    "custom qr code",
    "trackable qr code",
  ],
  authors: [{ name: "QRWolf" }],
  creator: "QRWolf",
  publisher: "QRWolf",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "QRWolf - Free QR Code Generator with Analytics",
    description: "Create professional QR codes in seconds. Custom colors, logos, dynamic URLs, and real-time scan analytics.",
    url: siteUrl,
    siteName: "QRWolf",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "QRWolf - Professional QR Code Generator",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRWolf - Free QR Code Generator",
    description: "Create professional QR codes with custom colors, logos, and real-time analytics.",
    images: [`${siteUrl}/opengraph-image`],
    creator: "@qrwolf",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider
          domain="qrwolf.com"
          trackOutboundLinks
          trackFileDownloads
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
