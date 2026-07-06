"use client";

import { Progress } from "radix-ui";
import { cn } from "../cn";

/** Soft glowing onboarding progress bar (0–100). */
export function ProgressPill({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <Progress.Root
      value={clamped}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-pill bg-lavender-200",
        className,
      )}
    >
      <Progress.Indicator
        className="bg-primary-gradient h-full rounded-pill shadow-glow transition-transform duration-500 ease-soft"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </Progress.Root>
  );
}
