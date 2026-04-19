import { PrismaClient } from "@prisma/client";
// Refreshed client instance to pick up schema changes
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  const models = Object.keys(prisma).filter(
    k => !k.startsWith("_") && !k.startsWith("$")
  );
  console.log("Prisma Models Initialized:", models.join(", "));
}
