import Link from "next/link";
import { Button, EmptyState } from "@dew/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center px-5">
      <EmptyState
        title="Not found"
        description="This admin page does not exist."
        className="w-full"
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
