import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { decrypt, getSessionToken } from "@/lib/session";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Reads the session cookie, then verifies against NeonDB that the user still
 * exists with the ADMIN role. Returns null when unauthenticated/unauthorized.
 */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const token = await getSessionToken();
  const session = await decrypt(token);
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user || user.role !== "ADMIN") return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
});

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
