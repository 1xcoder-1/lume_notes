import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    if (user.role !== "admin") {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tenantId = (user as any).tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const [memberCount, adminCount, tenant] = await Promise.all([
      prisma.user.count({
        where: {
          tenant_id: tenantId,
          role: "member",
        },
      }),
      prisma.user.count({
        where: {
          tenant_id: tenantId,
          role: "admin",
        },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { 
          name: true,
          members_can_edit: true,
          members_can_create: true,
          members_can_share: true
        } as any,
      }),
    ]);

    return NextResponse.json({
      name: tenant?.name || "Organization",
      memberCount,
      adminCount,
      totalCount: memberCount + adminCount,
      members_can_edit: (tenant as any)?.members_can_edit ?? true,
      members_can_create: (tenant as any)?.members_can_create ?? true,
      members_can_share: (tenant as any)?.members_can_share ?? true,
    });
  } catch (error) {
    console.error("Fetch organization stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
