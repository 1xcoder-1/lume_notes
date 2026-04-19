import { prisma } from "./lib/db";

async function test() {
  try {
    const folders = await prisma.folder.findMany({
      include: { shared_folder: true } as any,
    });
    console.log("Folders found:", folders.length);
    console.log(
      "Shared Folder model exists on prisma:",
      !!(prisma as any).sharedFolder
    );
  } catch (e) {
    console.error("Prisma check failed:", e);
  }
}

test();
