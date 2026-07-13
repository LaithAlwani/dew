import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SITE, SITE_URL, abs } from "./site-config";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: "%s · Dew",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "beauty",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
    // opengraph-image.tsx is picked up automatically.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.shortDescription,
    site: SITE.twitter,
    creator: SITE.twitter,
    // twitter-image.tsx is picked up automatically.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#2E2440" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Structured data — Organization + WebSite (rich results / knowledge panel).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": abs("/#organization"),
      name: SITE.name,
      url: SITE_URL,
      logo: abs("/icon"),
      description: SITE.description,
      sameAs: [
        "https://twitter.com/dewbeautyapp",
        "https://instagram.com/dewbeautyapp",
      ],
    },
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      url: SITE_URL,
      name: SITE.name,
      description: SITE.description,
      publisher: { "@id": abs("/#organization") },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-dvh antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
