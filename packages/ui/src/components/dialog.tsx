"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "../cn";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink-900/30 backdrop-blur-sm" />
      <D.Content
        className={cn(
          "glass-strong fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <D.Close
          aria-label="Close"
          className="absolute right-4 top-4 text-ink-500 transition hover:text-foreground"
        >
          <X className="size-5" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof D.Title>) {
  return <D.Title className={cn("text-xl", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof D.Description>) {
  return (
    <D.Description
      className={cn("mt-1 text-sm text-ink-500", className)}
      {...props}
    />
  );
}
