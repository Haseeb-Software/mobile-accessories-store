import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/**
 * Use inside API route handlers to enforce admin auth.
 * Returns the session if valid, or null if unauthorized (caller should return 401).
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}
