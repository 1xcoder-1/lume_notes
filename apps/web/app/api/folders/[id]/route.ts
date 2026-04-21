import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenant_id: true },
    });

    if (!userRecord || userRecord.tenant_id !== session.user.tenantId) {
      return NextResponse.json(
        { error: "Tenant not found or access revoked" },
        { status: 403 }
      );
    }
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.note.deleteMany({
        where: {
          tenant_id: session.user.tenantId,
          folder: folder.name,
        },
      }),

      prisma.folder.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenant_id: true },
    });

    if (!userRecord || userRecord.tenant_id !== session.user.tenantId) {
      return NextResponse.json(
        { error: "Tenant not found or access revoked" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const updatedFolder = await prisma.$transaction(async tx => {
      // Update folder name
      const updated = await tx.folder.update({
        where: { id },
        data: { name },
      });

      // Synchronize note folder names
      await tx.note.updateMany({
        where: {
          tenant_id: session.user.tenantId,
          folderId: id,
        },
        data: {
          folder: name,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Update folder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
