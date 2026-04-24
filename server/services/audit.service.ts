import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const AuditService = {
  async log(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    ip?: string;
    resource?: string;
    metadata?: any;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          ip: data.ip,
          resource: data.resource,
          metadata: data.metadata || {},
        },
      });
    } catch (err) {
      console.error("[AuditService] Failed to persist audit log:", err);
      // Fallback to console for critical visibility
      console.warn("🚨 [AUDIT_FALLBACK]", data);
    }
  },
};
