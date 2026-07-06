import * as React from "react";
import { cn } from "../cn";
import { GlassCard } from "./card";

/**
 * Titled skeleton screen used for not-yet-built routes so the whole app is
 * navigable. Replaced by real screens as each phase lands.
 */
export function PagePlaceholder({
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-md px-5 pb-28 pt-10", className)}>
      {badge && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
          {badge}
        </p>
      )}
      <h1 className="text-3xl leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-ink-500">{subtitle}</p>}
      <GlassCard className="mt-6">
        {children ?? (
          <p className="text-sm text-ink-500">
            This screen is part of the Dew blueprint and lands in an upcoming
            phase.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
