"use client";

import * as React from "react";
import { Avatar as A } from "radix-ui";
import { cn } from "../cn";

export function Avatar({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  return (
    <A.Root
      className={cn(
        "glass inline-flex size-12 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      {src && <A.Image src={src} alt={alt} className="size-full object-cover" />}
      <A.Fallback className="text-sm font-medium text-purple-700">
        {fallback}
      </A.Fallback>
    </A.Root>
  );
}
