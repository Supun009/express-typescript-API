import prisma from "../config/db.js";
import { AuditAction, createAuditLog } from "./auditService.js";
import type { RequestContext } from "../utils/requestContext.js";

export const revokeAllSessionsUser = async (
  userId: string,
  currentSessionId: string,
  context: RequestContext
) => {
  try {
    const { count } = await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });

    await createAuditLog({
      userId,
      sessionId: currentSessionId,
      action: AuditAction.ALL_SESSIONS_REVOKE_SUCCESS,
      status: "SUCCESS",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
      metadata: { revokedCount: count },
    });

    return count;
  } catch (error) {
    await createAuditLog({
      userId,
      sessionId: currentSessionId,
      action: AuditAction.ALL_SESSIONS_REVOKE_FAILED,
      status: "FAILURE",
      errorMessage: error instanceof Error ? error.message : "Failed to revoke sessions",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
    });
    throw error;
  }
};