"use client";

import { useEffect } from "react";

/** Registers the PWA service worker in production. */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failures are non-fatal */
    });
  }, []);
  return null;
}
