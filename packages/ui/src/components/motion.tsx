"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../cn";

/** Soft radial glow layer — place behind hero/cards. */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("glow pointer-events-none absolute inset-0 -z-10", className)}
    />
  );
}

/** Gently drifting card for the pre-onboarding mini-story (Blueprint §2). */
export function FloatingCard({
  children,
  delay = 0,
  distance = 10,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Fade + rise on mount — the standard Dew screen entrance. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
