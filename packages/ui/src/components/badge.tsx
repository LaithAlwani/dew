import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck, Crown } from "lucide-react";
import { cn } from "../cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-lavender-100 text-purple-700",
        verified: "bg-success/15 text-success",
        premium: "bg-primary-gradient text-white shadow-glow",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "verified" && <BadgeCheck className="size-3.5" />}
      {variant === "premium" && <Crown className="size-3.5" />}
      {children}
    </span>
  );
}
