import prisma from "../config/db.js";
import { AuditAction, createAuditLog } from "./auditService.js";
import type { RequestContext } from "../utils/requestContext.js";
import appAssert from "../utils/appAssert.js";
import { HttpStatus } from "../constant/http.js";

export const revokeSessionByID = async (
  sessionId: string,
  userId: string,
  context: RequestContext,
) => {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId, // Ensures a user can only revoke their own session
      },
    });

    if (!session) {
      await createAuditLog({
        userId,
        action: AuditAction.SESSION_REVOKE_FAILED,
        status: "FAILURE",
        errorMessage: "Session not found or does not belong to user",
        ipAddress: context.ip || "Unknown",
        userAgent: context.userAgent || "Unknown",
      });
      appAssert(session, HttpStatus.NOT_FOUND, "Session not found");
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    await createAuditLog({
      userId,
      sessionId,
      action: AuditAction.SESSION_REVOKE_SUCCESS,
      status: "SUCCESS",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
    });
  } catch (error) {
    await createAuditLog({
      userId,
      action: AuditAction.SESSION_REVOKE_FAILED,
      status: "FAILURE",
      errorMessage:
        error instanceof Error ? error.message : "Failed to revoke session",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
    });
    throw error;
  }
};

export const revokeAllSessionsUser = async (
  userId: string,
  currentSessionId: string,
  context: RequestContext,
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
      errorMessage:
        error instanceof Error ? error.message : "Failed to revoke sessions",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
    });
    throw error;
  }
};
