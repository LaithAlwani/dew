import { Skeleton } from "@dew/ui";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="rounded-card h-48 w-full" />
    </div>
  );
}
