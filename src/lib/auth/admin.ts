import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export type AdminUser = {
  userId: string;
  email: string;
  role: string;
};

/**
 * Returns the current user if they have role "admin", otherwise null.
 * Use in admin API routes.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session) return null;

  const client = prisma as unknown as {
    user?: {
      findUnique: (args: unknown) => Promise<{ id: string; email: string; role: string } | null>;
    };
  };
  if (!client.user) return null;

  const user = await client.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) return null;
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  if (!isAdmin) return null;
  return { userId: user.id, email: user.email, role: user.role };
}
