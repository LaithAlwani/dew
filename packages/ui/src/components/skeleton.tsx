import * as React from "react";
import { cn } from "../cn";

/** Shimmer skeleton — use instead of blank white while loading (Blueprint §5). */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-lavender-200/60", className)}
      {...props}
    />
  );
}
