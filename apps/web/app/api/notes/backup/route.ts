import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Log the action
  await logAction({
    tenant_id: (session.user as any).tenantId,
    user_id: session.user.id,
    action: "EXPORT_BACKUP",
    details: { format: "json" },
  });

  try {
    const notes = await prisma.note.findMany({
      where: {
        tenant_id: (session.user as any).tenantId,
      },
      include: {
        folderObj: true,
      },
    });

    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      organization: (session.user as any).tenantSlug,
      notes: notes.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        folder: note.folderObj?.name || "root",
        created_at: note.created_at,
        updated_at: note.updated_at,
      })),
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lume_notes_backup_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
