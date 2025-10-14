import prisma from "../config/db.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import {
  parseUserAgent,
  type RequestContext,
} from "../utils/requestContext.js";
import { sanitizeInput } from "../utils/sanitizer.js";
import { AuditAction, createAuditLog } from "./auditService.js";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log(users);
  return users;
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isDeleted: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const updateUserByAdmin = async (
  adminId: string,
  userId: string,
  data: { name: string },
  context: RequestContext,
) => {
  const user = await getUserById(userId);

  appAssert(user, HttpStatus.NOT_FOUND, "User not found");

  const sanitizedName = sanitizeInput(data.name);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name: sanitizedName },
  });

  await createAuditLog({
    userId: adminId,
    action: AuditAction.ADMIN_USER_UPDATE,
    ipAddress: context.ip || "unknown",
    userAgent: context.userAgent || "unknown",
    status: "SUCCESS",
    metadata: parseUserAgent(context.userAgent),
  });

  return updatedUser;
};

export const deleteUserById = async (
  adminId: string,
  userId: string,
  context: RequestContext,
) => {
  const deleted = await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
    },
  });

  appAssert(deleted, HttpStatus.NOT_FOUND, "User not found");

  await createAuditLog({
    userId: adminId,
    action: AuditAction.ADMIN_USER_DELETE,
    ipAddress: context.ip || "unknown",
    userAgent: context.userAgent || "unknown",
    status: "SUCCESS",
    metadata: parseUserAgent(context.userAgent),
  });
};

export const deleteUsers = async (
  adminId: string,
  userIds: string[],
  context: RequestContext,
) => {
  const deleted = await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: {
      isDeleted: true,
    },
  });

  appAssert(deleted, HttpStatus.NOT_FOUND, "Users not found");

  await createAuditLog({
    userId: adminId,
    action: AuditAction.ADMIN_USER_DELETE,
    ipAddress: context.ip || "unknown",
    userAgent: context.userAgent || "unknown",
    status: "SUCCESS",
    metadata: parseUserAgent(context.userAgent),
  });
};

export const revokeSessionsByAdmin = async (
  adminId: string,
  userIds: string[],
  context: RequestContext,
) => {
  try {
    const sessions = await prisma.session.deleteMany({
      where: {
        userId: { in: userIds },
      },
    });

    if (!sessions) {
      await createAuditLog({
        userId: adminId,
        action: AuditAction.ADMIN_SESSION_REVOKE_FAILED,
        status: "FAILURE",
        errorMessage: "Session not found",
        ipAddress: context.ip || "unknown",
        userAgent: context.userAgent || "unknown",
      });
      appAssert(sessions, HttpStatus.NOT_FOUND, "Sessions not found");
    } else {
      await createAuditLog({
        userId: adminId,
        action: AuditAction.ADMIN_SESSION_REVOKE_SUCCESS,
        status: "SUCCESS",
        ipAddress: context.ip || "unknown",
        userAgent: context.userAgent || "unknown",
        metadata: {
          targetUserIds: userIds,
          ...parseUserAgent(context.userAgent),
        },
      });
    }
  } catch (error) {
    await createAuditLog({
      userId: adminId,
      action: AuditAction.ADMIN_SESSION_REVOKE_FAILED,
      status: "FAILURE",
      errorMessage:
        error instanceof Error ? error.message : "Failed to revoke session",
      ipAddress: context.ip || "unknown",
      userAgent: context.userAgent || "unknown",
    });
    throw error;
  }
};
