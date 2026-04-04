import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiLimiter, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!(await apiLimiter.check(30, `public_${ip}`))) {
    return rateLimitResponse();
  }

  try {
    const { token } = await params;

    const sharedNote = await prisma.sharedNote.findUnique({
      where: { token },
      include: {
        note: {
          include: {
            author: {
              select: {
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!sharedNote) {
      return NextResponse.json(
        { error: "Shared note not found" },
        { status: 404 }
      );
    }

    if (!sharedNote.is_public) {
      return NextResponse.json(
        { error: "This note is no longer shared" },
        { status: 403 }
      );
    }

    if (sharedNote.expires_at && new Date(sharedNote.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 410 }
      );
    }

    prisma.sharedNote
      .update({
        where: { id: sharedNote.id },
        data: { view_count: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json({
      id: sharedNote.note.id,
      title: sharedNote.note.title,
      content: sharedNote.note.content,
      created_at: sharedNote.note.created_at,
      updated_at: sharedNote.note.updated_at,
      author: sharedNote.note.author,
      include_css: sharedNote.include_css,
      view_count: sharedNote.view_count,
    });
  } catch (error) {
    console.error("Get shared note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
