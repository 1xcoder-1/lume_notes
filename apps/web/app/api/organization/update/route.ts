import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateOrganizationSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
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
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateOrganizationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { name, members_can_edit, members_can_create, members_can_share } =
      validationResult.data;

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name && { name: name.trim() }),
        ...(members_can_edit !== undefined && { members_can_edit }),
        ...(members_can_create !== undefined && { members_can_create }),
        ...(members_can_share !== undefined && { members_can_share }),
      },
    });

    return NextResponse.json({
      message: "Organization updated successfully",
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        members_can_edit: (updatedTenant as any).members_can_edit,
        members_can_create: (updatedTenant as any).members_can_create,
        members_can_share: (updatedTenant as any).members_can_share,
      },
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
