import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateNoteSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
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

    const { id } = await params;
    const note = await prisma.note.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
      include: { author: { select: { email: true } } },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Get note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
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

    const { id } = await params;
    const body = await request.json();

    const validationResult = updateNoteSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { title, content, tags, folder, folderId } = validationResult.data;

    const [note, tenant] = await Promise.all([
      prisma.note.findFirst({
        where: {
          id,
          tenant_id: session.user.tenantId,
        },
      }),
      prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
      }),
    ]);

    if (!note || !tenant) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (session.user.role === "member" && !(tenant as any).members_can_edit) {
      return NextResponse.json(
        { error: "Access denied: Members cannot edit notes" },
        { status: 403 }
      );
    }

    const updatedNote = await prisma.$transaction(async tx => {
      // 1. Check if content or title actually changed
      const contentChanged =
        content !== undefined &&
        JSON.stringify(content) !== JSON.stringify(note.content);
      const titleChanged = title !== undefined && title !== note.title;

      if (contentChanged || titleChanged) {
        // 2. Check if we should create a new history entry or skip (throttling)
        // Find the most recent history entry for this note
        const lastHistory = await tx.noteHistory.findFirst({
          where: { note_id: id },
          orderBy: { created_at: "desc" },
        });

        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const isRecent =
          lastHistory && new Date(lastHistory.created_at) > twoMinutesAgo;

        if (!isRecent) {
          // Only create history entry if the last one isn't too recent
          console.log(`[DEBUG] Creating new history entry for note: ${id}`);
          await tx.noteHistory.create({
            data: {
              note_id: id,
              title: note.title,
              content: note.content as any,
            },
          });
        } else {
          console.log(
            `[DEBUG] Skipping history entry (too recent) for note: ${id}`
          );
        }
      }

      return tx.note.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(tags !== undefined && { tags }),
          ...(folder !== undefined && { folder }),
          ...(folderId !== undefined && { folderId }),
        },
        include: { author: { select: { email: true } } },
      });
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
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

    const { id } = await params;
    const note = await prisma.note.findFirst({
      where: {
        id,
        tenant_id: session.user.tenantId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
