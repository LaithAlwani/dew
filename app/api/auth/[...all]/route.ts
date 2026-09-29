import { handler } from "@/lib/auth-server";

// Better Auth's Next.js route handler (sign-in, sign-up, sign-out, session).
export const { GET, POST } = handler;
