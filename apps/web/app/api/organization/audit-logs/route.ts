import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // @ts-ignore - Prisma client types need a refresh in the IDE after generation
    const logs = await prisma.auditLog.findMany({
      where: {
        tenant_id: (session.user as any).tenantId,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
