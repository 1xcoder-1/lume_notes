import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNoteSchema } from "@/lib/validations";
import { apiLimiter, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
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

    const notes = await prisma.note.findMany({
      where: { tenant_id: session.user.tenantId },
      include: {
        author: { select: { email: true } },
        shared_note: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await apiLimiter.check(10, session.user.id))) {
    return rateLimitResponse();
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

    const validationResult = createNoteSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { title, content, folder, folderId, tags } = validationResult.data;

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (session.user.role === "member" && !(tenant as any).members_can_create) {
      return NextResponse.json(
        { error: "Access denied: Members cannot create notes" },
        { status: 403 }
      );
    }

    if (tenant.plan === "free") {
      const noteCount = await prisma.note.count({
        where: { tenant_id: session.user.tenantId },
      });

      if (noteCount >= 3) {
        return NextResponse.json(
          { error: "Free plan limit reached" },
          { status: 403 }
        );
      }
    }

    const note = await prisma.note.create({
      data: {
        title: title ?? "",
        content,
        tenant_id: session.user.tenantId,
        author_id: session.user.id,
        folder,
        folderId: folderId || null,
        tags: tags || [],
      } as any,
      include: { author: { select: { email: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
