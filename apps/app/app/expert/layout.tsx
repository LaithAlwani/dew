import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageCircle,
  User,
} from "lucide-react";
import type { NavItem } from "@dew/ui";
import { AppShell } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/expert/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5" /> },
  { href: "/expert/calendar", label: "Calendar", icon: <CalendarDays className="size-5" /> },
  { href: "/expert/clients", label: "Clients", icon: <Users className="size-5" /> },
  { href: "/expert/messages", label: "Messages", icon: <MessageCircle className="size-5" /> },
  { href: "/expert/profile", label: "Profile", icon: <User className="size-5" /> },
];

export default function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell nav={nav}>{children}</AppShell>;
}
