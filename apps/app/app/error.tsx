"use client";

import { ErrorState } from "@dew/ui";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center px-5">
      <ErrorState
        onRetry={reset}
        description="We could not load this page. Please try again."
        className="w-full"
      />
    </div>
  );
}
