import { prisma } from "../lib/db";

async function check() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("NoteHistory exists:", !!(prisma as any).noteHistory);
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
