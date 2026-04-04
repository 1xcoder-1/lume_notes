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
    const tenantId = (user as any).tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        tenant_id: tenantId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch organization users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
