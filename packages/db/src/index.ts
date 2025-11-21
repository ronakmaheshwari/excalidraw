import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ??
  new PrismaClient({
    log: ["query", "warn", "error"],
    adapter, // ← THIS is required in Prisma 7
  });

if (process.env.NODE_ENV !== "production") global.prisma = db;