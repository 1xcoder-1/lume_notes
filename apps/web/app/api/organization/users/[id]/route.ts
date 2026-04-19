import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenant_id: true },
    });

    if (
      !userRecord ||
      userRecord.tenant_id !== (session.user as any).tenantId
    ) {
      return NextResponse.json(
        { error: "Tenant not found or access revoked" },
        { status: 403 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Verify the user belongs to the same tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: "User not found in this organization" },
        { status: 404 }
      );
    }

    // Unlink the user from the organization
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        tenant_id: null,
        role: "member", // Reset role
      },
    });

    return NextResponse.json({ message: "User removed successfully" });
  } catch (error) {
    console.error("Remove organization user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
