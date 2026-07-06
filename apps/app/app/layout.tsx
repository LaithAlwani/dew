import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { DewAuthProvider } from "@dew/auth";
import { RegisterSW } from "@/components/register-sw";
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
  title: {
    default: "Dew",
    template: "%s · Dew",
  },
  description: "Personalized beauty guidance that actually fits you.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.webp", shortcut: "/logo.webp", apple: "/logo.webp" },
  appleWebApp: { capable: true, title: "Dew", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#faf8ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full`}
    >
      <body className="min-h-dvh antialiased">
        <DewAuthProvider>{children}</DewAuthProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
