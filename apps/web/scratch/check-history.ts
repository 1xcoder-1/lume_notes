import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

// Load .env from apps/web/.env
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const historyCount = await prisma.noteHistory.count();
  const latestHistory = await prisma.noteHistory.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      note_id: true,
      title: true,
      created_at: true,
    },
  });

  console.log("Total History Entries:", historyCount);
  console.log("Latest Entries:", JSON.stringify(latestHistory, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
