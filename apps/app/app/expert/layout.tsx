import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageCircle,
  User,
} from "lucide-react";
import type { NavItem } from "@dew/ui";
import { getUserAccess } from "@dew/auth/role";
import { AppShell } from "@/components/app-shell";

// Per-request role gate — never statically prerender.
export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/expert/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5" /> },
  { href: "/expert/calendar", label: "Calendar", icon: <CalendarDays className="size-5" /> },
  { href: "/expert/clients", label: "Clients", icon: <Users className="size-5" /> },
  { href: "/expert/messages", label: "Messages", icon: <MessageCircle className="size-5" /> },
  { href: "/expert/profile", label: "Profile", icon: <User className="size-5" /> },
];

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Expert dashboard: approved experts only. Anyone who isn't verified yet
  // (pending / not-an-expert) is sent to verify — that's the path to get in.
  const access = await getUserAccess();
  if (!access?.isExpert) redirect("/become-expert");
  // Experts are always clients too — offer a switch back to the client side.
  return <AppShell nav={nav} switchTo="client">{children}</AppShell>;
}
