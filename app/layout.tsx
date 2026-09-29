import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getToken } from "@/lib/auth-server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonts (Fraunces/Inter) and the real palette land in Phase 6/7.
export const metadata: Metadata = {
  title: "Dew",
  description: "Dew — thoughtful introductions for beauty and makeup.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialToken = await getToken();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider initialToken={initialToken}>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
