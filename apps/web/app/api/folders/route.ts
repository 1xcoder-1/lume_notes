import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createFolderSchema } from "@/lib/validations";

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

    const folders = await prisma.folder.findMany({
      where: { tenant_id: session.user.tenantId },
      orderBy: { created_at: "asc" },
    });

    // Safe fetch for sharing data to bypass Prisma Client include issues
    const foldersWithSharing = await Promise.all(
      folders.map(async folder => {
        try {
          // @ts-ignore
          const sharing = await (prisma as any).sharedFolder.findUnique({
            where: { folder_id: folder.id },
          });
          return { ...folder, sharing };
        } catch (e) {
          return { ...folder, sharing: null };
        }
      })
    );

    return NextResponse.json(foldersWithSharing);
  } catch (error) {
    console.error("Get folders error:", error);
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
    const result = createFolderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid folder name" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (
      session.user.role === "member" &&
      !(tenant as any)?.members_can_create
    ) {
      return NextResponse.json(
        { error: "Access denied: Members cannot create folders" },
        { status: 403 }
      );
    }

    const { name, parentId } = result.data;

    const folder = await prisma.folder.create({
      data: {
        name,
        tenant_id: session.user.tenantId,
        parentId: parentId || null,
      } as any,
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
