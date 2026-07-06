import { Skeleton } from "@dew/ui";

// Shimmer, not a blank white screen (Blueprint §5).
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-5 pt-10">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="rounded-card h-40 w-full" />
      <Skeleton className="rounded-card h-40 w-full" />
    </div>
  );
}
