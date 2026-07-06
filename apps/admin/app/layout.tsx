import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { DewAuthProvider } from "@dew/auth";
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
    default: "Dew Admin",
    template: "%s · Dew Admin",
  },
  description: "Dew platform administration — approvals, safety and moderation.",
  robots: { index: false, follow: false },
  icons: { icon: "/logo.webp", shortcut: "/logo.webp" },
};

export const viewport: Viewport = {
  themeColor: "#faf8ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-dvh antialiased">
        <DewAuthProvider>{children}</DewAuthProvider>
      </body>
    </html>
  );
}
