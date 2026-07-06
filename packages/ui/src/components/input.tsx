import * as React from "react";
import { cn } from "../cn";

const fieldBase =
  "w-full rounded-md glass px-4 py-3 text-sm text-foreground placeholder:text-ink-500/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-24 resize-none", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
