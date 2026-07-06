import * as React from "react";
import { cn } from "../cn";

/** Solid rounded surface with a soft purple-tinted shadow. */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-card bg-surface p-6 shadow-soft", className)}
    {...props}
  />
));
Card.displayName = "Card";

/** Frosted-glass card — the default Dew surface (translucent + backdrop blur). */
export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("glass rounded-card p-6", className)} {...props} />
));
GlassCard.displayName = "GlassCard";
