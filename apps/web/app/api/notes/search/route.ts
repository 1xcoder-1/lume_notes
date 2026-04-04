import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiLimiter, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await apiLimiter.check(20, session.user.id))) {
    return rateLimitResponse();
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const sanitizedQuery = query.trim().toLowerCase();
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const authorId = searchParams.get("authorId");

    if (
      !sanitizedQuery &&
      (!tags || tags.length === 0) &&
      !startDate &&
      !endDate &&
      !authorId
    ) {
      return NextResponse.json([]);
    }

    const where: any = {
      tenant_id: session.user.tenantId,
    };

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    if (authorId) {
      where.author_id = authorId;
    }
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        author: { select: { email: true, id: true } },
      },
      orderBy: { created_at: "desc" },
    });

    if (!sanitizedQuery) {
      return NextResponse.json(notes.slice(0, 20));
    }

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const searchRegex = new RegExp(`\\b${escapeRegExp(sanitizedQuery)}`, "i");

    const extractPlainText = (contentItem: any): string => {
      if (!contentItem) return "";
      if (typeof contentItem === "string") return contentItem;
      if (Array.isArray(contentItem)) {
        return contentItem.map(extractPlainText).join(" ");
      }
      if (contentItem.type === "text" && contentItem.text) {
        return contentItem.text;
      }
      if (contentItem.content) {
        return extractPlainText(contentItem.content);
      }
      return "";
    };

    const filteredNotes = notes
      .filter(note => {
        const titleMatch = searchRegex.test(note.title);

        let contentMatch = false;
        if (typeof note.content === "object" && note.content !== null) {
          const plainText = extractPlainText(note.content);
          contentMatch = searchRegex.test(plainText);
        }

        return titleMatch || contentMatch;
      })

      .sort((a, b) => {
        const aTitle = searchRegex.test(a.title);
        const bTitle = searchRegex.test(b.title);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })
      .slice(0, 20);

    return NextResponse.json(filteredNotes);
  } catch (error) {
    console.error("Search notes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
