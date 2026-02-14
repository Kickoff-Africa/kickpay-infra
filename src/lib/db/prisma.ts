import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function getPrisma(): PrismaClient {
  let client = globalForPrisma.prisma;
  if (!client) {
    client = createPrismaClient();
    globalForPrisma.prisma = client;
  }
  // In development, if the client was cached before User model existed, the user delegate may be missing
  if (process.env.NODE_ENV !== "production" && !(client as { user?: unknown }).user) {
    globalForPrisma.prisma = undefined;
    return createPrismaClient();
  }
  return client;
}

export const prisma = getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
