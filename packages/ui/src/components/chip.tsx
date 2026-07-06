"use client";

import * as React from "react";
import { cn } from "../cn";

const chipBase =
  "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium transition-all duration-300 ease-soft";

/** Static tag / label chip. */
export function Chip({
  className,
  active,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { active?: boolean }) {
  return (
    <span
      className={cn(
        chipBase,
        active
          ? "bg-primary-gradient text-white shadow-glow"
          : "glass text-purple-700",
        className,
      )}
      {...props}
    />
  );
}

/** Toggleable filter chip (button). */
export const ChipButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={active}
    className={cn(
      chipBase,
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
      active
        ? "bg-primary-gradient text-white shadow-glow"
        : "glass text-purple-700 hover:shadow-float",
      className,
    )}
    {...props}
  />
));
ChipButton.displayName = "ChipButton";
