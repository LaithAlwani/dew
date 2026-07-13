import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Create your Dew account and get matched with vetted beauty experts around your real goals, budget, and skin.",
  alternates: { canonical: "/get-started" },
  openGraph: { title: "Get started · Dew", url: "/get-started" },
};

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
