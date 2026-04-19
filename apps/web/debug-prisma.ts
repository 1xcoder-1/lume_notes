import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log("Loading Prisma Client...");
  const prisma = new PrismaClient();
  console.log("Prisma Client loaded.");

  // Try to inspect the client
  const folderInclude = (prisma as any)._baseDmmf?.datamodel?.models?.find(
    (m: any) => m.name === "Folder"
  )?.fields;
  console.log(
    "Folder fields:",
    folderInclude?.map((f: any) => f.name).join(", ")
  );

  const sharingField = folderInclude?.find((f: any) => f.name === "sharing");
  if (sharingField) {
    console.log("SUCCESS: 'sharing' field found in Folder model!");
  } else {
    console.log("FAILURE: 'sharing' field NOT found in Folder model.");
  }
}

test().catch(console.error);
