import { redirect } from "next/navigation";
import { getUserAccess } from "@dew/auth/role";
import { ExpertVerification } from "./verification";

// Role/status check needs the live session.
export const dynamic = "force-dynamic";

export default async function Page() {
  const access = await getUserAccess();
  // Already verified — straight to the expert dashboard.
  if (access?.isExpert) redirect("/expert/dashboard");
  return <ExpertVerification />;
}
