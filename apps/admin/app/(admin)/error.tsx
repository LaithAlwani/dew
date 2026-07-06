"use client";

import { ErrorState } from "@dew/ui";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      onRetry={reset}
      description="We could not load this admin page. Please try again."
    />
  );
}
