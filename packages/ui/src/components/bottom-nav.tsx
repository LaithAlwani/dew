"use client";

import * as React from "react";
import { cn } from "../cn";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Raised floating pill navigation (Blueprint §1). Active tab glows deeper purple.
 * `renderLink` lets the consuming app inject its router's <Link>, keeping
 * @dew/ui free of a Next.js dependency.
 */
export function BottomNav({
  items,
  activeHref,
  renderLink,
  className,
}: {
  items: NavItem[];
  activeHref?: string;
  renderLink?: (
    item: NavItem,
    active: boolean,
    children: React.ReactNode,
  ) => React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "glass-strong fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-pill px-2 py-2",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        const inner = (
          <span
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all duration-300 ease-soft",
              active ? "text-purple-700" : "text-ink-500",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-all duration-300 ease-soft",
                active && "bg-primary-gradient text-white shadow-glow",
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </span>
        );
        return (
          <React.Fragment key={item.href}>
            {renderLink ? (
              renderLink(item, active, inner)
            ) : (
              <a href={item.href} aria-current={active ? "page" : undefined}>
                {inner}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
