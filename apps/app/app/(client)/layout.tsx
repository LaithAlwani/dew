import { Home, Sparkles, CalendarDays, Users, User } from "lucide-react";
import type { NavItem } from "@dew/ui";
import { getUserAccess } from "@dew/auth/role";
import { AppShell } from "@/components/app-shell";

// Provisions the user per-request — never statically prerender.
export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/home", label: "Home", icon: <Home className="size-5" /> },
  { href: "/experts", label: "Experts", icon: <Sparkles className="size-5" /> },
  { href: "/appointments", label: "Bookings", icon: <CalendarDays className="size-5" /> },
  { href: "/community", label: "Community", icon: <Users className="size-5" /> },
  { href: "/profile", label: "Profile", icon: <User className="size-5" /> },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every signed-in user is a client, so the client area is open to all — this
  // provisions the user row and offers approved experts a switch to their side.
  const access = await getUserAccess();
  return (
    <AppShell nav={nav} switchTo={access?.isExpert ? "expert" : undefined}>
      {children}
    </AppShell>
  );
}
