import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const noteCount = await prisma.note.count({
      where: { tenant_id: session.user.tenantId },
    });

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    return NextResponse.json({
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      noteCount,
      limit: tenant.plan === "free" ? 3 : null,
      email: userRecord?.email || null,
      members_can_edit: (tenant as any).members_can_edit,
      members_can_create: (tenant as any).members_can_create,
      members_can_share: (tenant as any).members_can_share,
    });
  } catch (error) {
    console.error("Get tenant info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
