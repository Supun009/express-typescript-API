import prisma from "../config/db.js";
import { AuditAction, createAuditLog } from "./auditService.js";
import type { RequestContext } from "../utils/requestContext.js";
import appAssert from "../utils/appAssert.js";
import { HttpStatus } from "../constant/http.js";

export interface RevokeSessionByIDArgs {
  sessionId: string;
  userId: string;
  context: RequestContext;
}

export const revokeSessionByID = async (args: RevokeSessionByIDArgs) => {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: args.sessionId,
        userId: args.userId,
      },
    });
    if (!session) {
      await createAuditLog({
        userId: args.userId,
        action: AuditAction.SESSION_REVOKE_FAILED,
        status: "FAILURE",
        errorMessage: "Session not found or does not belong to user",
        ipAddress: args.context.ip || "Unknown",
        userAgent: args.context.userAgent || "Unknown",
      });
      appAssert(session, HttpStatus.NOT_FOUND, "Session not found");
    }

    await prisma.session.delete({
      where: { id: args.sessionId },
    });

    await createAuditLog({
      userId: args.userId,
      sessionId: args.sessionId,
      action: AuditAction.SESSION_REVOKE_SUCCESS,
      status: "SUCCESS",
      ipAddress: args.context.ip || "Unknown",
      userAgent: args.context.userAgent || "Unknown",
    });
  } catch (error) {
    console.log(error);
    await createAuditLog({
      userId: args.userId,
      action: AuditAction.SESSION_REVOKE_FAILED,
      status: "FAILURE",
      errorMessage:
        error instanceof Error ? error.message : "Failed to revoke session",
      ipAddress: args.context.ip || "Unknown",
      userAgent: args.context.userAgent || "Unknown",
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
