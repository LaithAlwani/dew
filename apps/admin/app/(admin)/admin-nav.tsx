"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@dew/ui";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/experts", label: "Experts" },
  { href: "/users", label: "Users" },
  { href: "/reports", label: "Reports" },
  { href: "/announcements", label: "Announcements" },
  { href: "/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <header className="glass-strong sticky top-0 z-40 flex items-center gap-4 px-5 py-3">
      <Image
        src="/logo.webp"
        alt="Dew"
        width={32}
        height={32}
        className="h-8 w-auto"
      />
      <span className="text-sm font-semibold text-purple-700">Admin</span>
      <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
        {items.map((i) => {
          const active =
            i.href === "/" ? pathname === "/" : pathname?.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-pill px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-soft",
                active
                  ? "bg-primary-gradient text-white shadow-glow"
                  : "text-ink-500 hover:bg-lavender-100",
              )}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
