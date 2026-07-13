"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { cn, BottomNav, type NavItem } from "@dew/ui";
import { ModeSwitchButton } from "@/components/mode-switch-button";

/**
 * Responsive app chrome (client + expert). Desktop: 248px frosted sidebar +
 * top bar (design "Dew Home Desktop"). Mobile: floating bottom nav.
 * Pass the audience's nav items; pages render only their content region.
 * `switchTo` shows a client/expert view switcher in the sidebar (dual users).
 */
export function AppShell({
  nav,
  switchTo,
  children,
}: {
  nav: NavItem[];
  switchTo?: "client" | "expert";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active =
    nav.find((i) => pathname === i.href || pathname?.startsWith(i.href + "/"))
      ?.href ?? undefined;

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_700px_at_62%_-10%,#F1EAF9,#E7DFF0_72%)] lg:flex">
      {/* Sidebar — desktop only */}
      <aside className="sticky top-0 hidden h-dvh w-[248px] flex-none flex-col border-r border-white/70 bg-white/60 px-5 py-7 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2 px-2 pb-8">
          <Image src="/logo.webp" alt="" width={34} height={34} className="h-[34px] w-auto" />
          <span className="font-display text-[27px] font-semibold tracking-wide text-purple-700">
            Dew
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {nav.map((item) => {
            const on = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[15px] px-4 py-3 text-sm font-semibold transition",
                  on
                    ? "bg-gradient-to-br from-purple-600/12 to-purple-400/12 text-purple-600"
                    : "text-ink-500 hover:bg-purple-500/[0.07] hover:text-ink-700",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          {switchTo && <ModeSwitchButton to={switchTo} />}
          <div className="bg-primary-gradient rounded-[18px] p-4 shadow-glow">
            <div className="font-display text-[17px] text-white">Go Premium</div>
            <div className="mt-1 text-[11px] leading-snug text-white/80">
              Message experts &amp; save 15% on consults.
            </div>
            <button className="mt-3 h-8 w-full rounded-full bg-white text-[11.5px] font-bold text-purple-600">
              Upgrade
            </button>
          </div>
          <div className="flex items-center gap-3 px-1.5 py-2">
            <div className="size-[38px] flex-none rounded-full bg-[linear-gradient(150deg,#E7D6F2,#F4E4EE)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-ink-900">Reeva K.</div>
              <div className="text-[11px] text-ink-400">Free plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="hidden h-[76px] flex-none items-center gap-5 border-b border-white/60 px-10 lg:flex">
          <div className="flex-1" />
          <div className="flex h-11 w-[320px] items-center gap-2.5 rounded-full border border-purple-600/10 bg-white/75 px-4">
            <Search className="size-[17px] text-ink-400" />
            <span className="text-[13.5px] text-ink-400">
              Search experts, concerns, products…
            </span>
          </div>
          <button
            aria-label="Notifications"
            className="relative flex size-11 items-center justify-center rounded-full border border-purple-600/10 bg-white/75"
          >
            <Bell className="size-[19px] text-purple-600" />
            <span className="absolute right-2.5 top-2 size-2 rounded-full border-2 border-white bg-fuchsia-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="lg:hidden">
        <BottomNav
          items={nav}
          activeHref={active}
          renderLink={(item, on, inner) => (
            <Link href={item.href} aria-current={on ? "page" : undefined}>
              {inner}
            </Link>
          )}
        />
      </div>
    </div>
  );
}
