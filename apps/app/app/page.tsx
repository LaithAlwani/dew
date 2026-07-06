import { redirect } from "next/navigation";

// The app starts at authentication. Signed-in users are sent on to /home by
// Clerk's redirect; the marketing site owns the pre-signup story (/get-started).
export default function Index() {
  redirect("/sign-in");
}
