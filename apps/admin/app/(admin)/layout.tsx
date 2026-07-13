import { notFound } from "next/navigation";
import { getUserAccess } from "@dew/auth/role";
import { AdminNav } from "./admin-nav";

// Rendered at request time (role check needs the live Clerk session + Convex).
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin-only: non-admins (and signed-out users the proxy let through) get a 404
  // rather than a redirect — the admin surface stays invisible to everyone else.
  const access = await getUserAccess();
  if (!access?.isAdmin) notFound();

  return (
    <div className="min-h-dvh">
      <AdminNav />
      <main className="mx-auto w-full max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
