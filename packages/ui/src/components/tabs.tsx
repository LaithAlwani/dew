"use client";

import * as React from "react";
import { Tabs as T } from "radix-ui";
import { cn } from "../cn";

export const Tabs = T.Root;
export const TabsContent = T.Content;

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof T.List>) {
  return (
    <T.List
      className={cn(
        "glass inline-flex items-center gap-1 rounded-pill p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        "rounded-pill px-4 py-1.5 text-sm font-medium text-ink-500 transition-all duration-300 ease-soft data-[state=active]:bg-[image:var(--gradient-primary)] data-[state=active]:text-white data-[state=active]:shadow-glow",
        className,
      )}
      {...props}
    />
  );
}
