import { redirect } from "next/navigation";
import { getUserAccess } from "@dew/auth/role";

// Smart landing: signed-out → sign-in; dual users → their remembered view.
export const dynamic = "force-dynamic";

export default async function Index() {
  const access = await getUserAccess();
  if (!access) redirect("/sign-in");
  if (access.isExpert && access.activeMode === "expert") redirect("/expert/dashboard");
  redirect("/home");
}
