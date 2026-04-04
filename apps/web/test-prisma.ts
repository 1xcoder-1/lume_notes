import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log("Folder model keys:", Object.keys(prisma).filter(k => k === 'folder'));
process.exit(0);
