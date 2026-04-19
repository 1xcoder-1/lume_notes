import { prisma } from "./db";

export async function logAction({
  tenant_id,
  user_id,
  action,
  entity_id,
  entity_type,
  details,
}: {
  tenant_id: string;
  user_id: string;
  action: string;
  entity_id?: string;
  entity_type?: string;
  details?: any;
}) {
  try {
    // @ts-ignore - Prisma client types need a refresh in the IDE after generation
    await prisma.auditLog.create({
      data: {
        tenant_id,
        user_id,
        action,
        entity_id,
        entity_type,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
}
