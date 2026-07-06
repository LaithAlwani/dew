import { Home, Sparkles, ScanLine, Users, User } from "lucide-react";
import type { NavItem } from "@dew/ui";
import { AppShell } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/home", label: "Home", icon: <Home className="size-5" /> },
  { href: "/experts", label: "Experts", icon: <Sparkles className="size-5" /> },
  { href: "/scan", label: "Scan", icon: <ScanLine className="size-5" /> },
  { href: "/community", label: "Community", icon: <Users className="size-5" /> },
  { href: "/profile", label: "Profile", icon: <User className="size-5" /> },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell nav={nav}>{children}</AppShell>;
}
