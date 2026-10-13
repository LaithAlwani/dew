import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getToken } from "@/lib/auth-server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

// Both are variable fonts, self-hosted by next/font (no runtime network font
// request). The CSS variables here are what @dew/tokens' --font-display and
// --font-body resolve to.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dew",
  description: "Dew — thoughtful introductions for beauty and makeup.",
};

// viewport-fit=cover lets env(safe-area-inset-*) resolve to real values on
// notched devices; the PWA theme colour lands with the manifest in step 12.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialToken = await getToken();
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider initialToken={initialToken}>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
