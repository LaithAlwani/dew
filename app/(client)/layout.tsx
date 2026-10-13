import type { ReactNode } from "react";

// The client journey (apex host): discovery, consultation, matches, home.
// noindex — this is the private, task-focused flow, not marketing.
export const metadata = { robots: { index: false, follow: false } };

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col">{children}</div>;
}
