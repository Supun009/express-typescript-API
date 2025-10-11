import AppError from "../utils/AppError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { toUserDto } from "../dtos/userDto.js";
import {
  createToken,
  refreshTokenSignOptions,
  verifyToken,
  type accessTokenPayload,
  type refreshTokenPayload,
} from "../utils/jwt.js";
import prisma from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import crypto from "crypto";
import { compareToken, hashToken } from "../utils/hashToken.js";
import Roles from "../constant/roles.js";
import { AuditAction, createAuditLog } from "./auditService.js";
import {
  parseUserAgent,
  type RequestContext,
} from "../utils/requestContext.js";
import { sanitizeInput } from "../utils/sanitizer.js";

export type LoginUSerType = {
  email: string;
  password: string;
};

export type RegisterUserType = {
  name: string;
  email: string;
  password: string;
};

export const loginUser = async (
  user: LoginUSerType,
  context: RequestContext,
) => {
  const sanitizedEmail = sanitizeInput(user.email);

  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (!existingUser) {
    await createAuditLog({
      action: AuditAction.LOGIN_FAILED,
      status: "FAILURE",
      errorMessage: "User not found",
      ipAddress: context?.ip || "Unknown",
      userAgent: context?.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });

    appAssert(existingUser, HttpStatus.NOT_FOUND, "User not found");
  }
  const isPasswordMatch = await comparePassword(
    user.password,
    existingUser.password,
  );

  if (!isPasswordMatch) {
    await createAuditLog({
      userId: existingUser.id,
      action: AuditAction.LOGIN_FAILED,
      ipAddress: context?.ip || "unknown",
      userAgent: context?.userAgent || "unknown",
      status: "FAILURE",
      errorMessage: "Invalid password",
      metadata: parseUserAgent(context.userAgent),
    });
    throw new AppError(HttpStatus.BAD_REQUEST, "Invalid password");
  }

  const session = await prisma.session.create({
    data: {
      userId: existingUser.id,
      role: existingUser.role,
      userAgent: context?.userAgent || "Unknown",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const accessTokenPayload: accessTokenPayload = {
    userID: existingUser.id,
    role: existingUser.role,
    sessionId: session.id,
  };

  const refreshTokenPayload: refreshTokenPayload = {
    sessionId: session.id,
    userId: existingUser.id,
  };

  const accessToken = createToken(accessTokenPayload);

  const refreshToken = createToken(
    refreshTokenPayload,
    refreshTokenSignOptions,
  );

  if (!accessToken || !refreshToken) {
    appAssert(
      !accessToken || !refreshToken,
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Token generation failed",
    );
  }
  await createAuditLog({
    userId: existingUser.id,
    sessionId: session.id,
    action: AuditAction.LOGIN_SUCCESS,
    ipAddress: context?.ip || "unknown",
    userAgent: context?.userAgent || "unknown",
    status: "SUCCESS",
    metadata: parseUserAgent(context.userAgent),
  });
  return { accessToken, refreshToken };
};

export const registerUser = async (
  user: RegisterUserType,
  context: RequestContext,
) => {
  const sanitizedEmail = sanitizeInput(user.email);
  const sanitizedName = sanitizeInput(user.name);

  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    await createAuditLog({
      action: AuditAction.REGISTER,
      status: "FAILURE",
      errorMessage: "User already exists",
      ipAddress: context?.ip || "Unknown",
      userAgent: context?.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });
    appAssert(!existingUser, HttpStatus.CONFLICT, "User already exists");
  }

  const hashedPassword = await hashPassword(user.password);

  const newUser = await prisma.user.create({
    data: {
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: Roles.USER,
    },
  });

  await createAuditLog({
    userId: newUser.id,
    action: AuditAction.REGISTER,
    status: "SUCCESS",
    ipAddress: context?.ip || "Unknown",
    userAgent: context?.userAgent || "Unknown",
    metadata: parseUserAgent(context.userAgent),
  });

  return toUserDto(newUser);
};

export const logoutUser = async (
  id: string,
  ip?: string,
  userAgent?: string,
) => {
  const session = await prisma.session.findUnique({
    where: { id },
  });

  // If session doesn't exist, we can't associate the failure with a user.
  if (!session) {
    await createAuditLog({
      action: AuditAction.LOGOUT_FAILD,
      status: "FAILURE",
      errorMessage: "Session not found or already logged out.",
      ipAddress: ip || "Unknown",
      userAgent: userAgent || "Unknown",
      metadata: parseUserAgent(userAgent || "Unknown"),
    });
    appAssert(session, HttpStatus.NOT_FOUND, "Session not found");
  }

  await prisma.session.delete({
    where: { id },
  });

  await createAuditLog({
    userId: session.userId,
    sessionId: session.id,
    action: AuditAction.LOGOUT,
    status: "SUCCESS",
    ipAddress: ip || "Unknown",
    userAgent: userAgent || "Unknown",
    metadata: parseUserAgent(userAgent || "Unknown"),
  });
};

export const refreshAccessToken = async (
  token: string,
  context: RequestContext,
) => {
  const decoded = verifyToken(token, refreshTokenSignOptions);

  if (!decoded) {
    await createAuditLog({
      action: AuditAction.TOKEN_REFRESH_FAILED,
      status: "FAILURE",
      errorMessage: "Invalid refresh token",
      ipAddress: context?.ip || "Unknown",
      userAgent: context?.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });
  }

  appAssert(decoded, HttpStatus.UNAUTHORIZED, "Invalid refresh token");

  const sessionId = decoded.sessionId;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  appAssert(
    session && session.expiresAt > new Date(),
    HttpStatus.UNAUTHORIZED,
    "Session expired",
  );

  const sessionNeedsUpdate =
    session.updatedAt < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  if (sessionNeedsUpdate) {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const newRefreshToken = sessionNeedsUpdate
    ? createToken(
        { sessionId: session.id, userId: session.userId },
        refreshTokenSignOptions,
      )
    : undefined;

  const accessToken = createToken({
    userID: session.userId,
    role: session.role,
    sessionId: session.id,
  });

  await createAuditLog({
    userId: session.userId,
    sessionId: session.id,
    action: AuditAction.TOKEN_REFRESH,
    status: "SUCCESS",
    ipAddress: context.userAgent || "Unknown",
    userAgent: context.userAgent || "Unknown",
    metadata: parseUserAgent(context.userAgent),
  });

  return { accessToken, newRefreshToken };
};

export const createResetToken = async (
  email: string,
  context: RequestContext,
) => {
  const sanitizedEmail = sanitizeInput(email);

  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  appAssert(user, HttpStatus.NOT_FOUND, "User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");

  const cryptoHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const hashedToken = await hashToken(cryptoHash);

  const passwordReset = await prisma.passwordReset.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await createAuditLog({
    userId: user.id,
    action: AuditAction.PASSWORD_RESET_REQUEST,
    status: "SUCCESS",
    ipAddress: context?.ip || "Unknown",
    userAgent: context?.userAgent || "Unknown",
    metadata: parseUserAgent(context?.userAgent || "Unknown"),
  });

  return { id: passwordReset.id, resetToken };
};

export const verifyResetToken = async (
  token: string,
  id: string,
  context: RequestContext,
): Promise<string> => {
  const passwordReset = await prisma.passwordReset.findFirst({
    where: { id },
    orderBy: { createdAt: "desc" },
  });

  if (!passwordReset) {
    await createAuditLog({
      action: AuditAction.PASSWORD_RESET_INVALID,
      status: "FAILURE",
      errorMessage: "Reset token not found",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });
  }

  appAssert(passwordReset, HttpStatus.NOT_FOUND, "Reset token not found");

  const cryptoHash = crypto.createHash("sha256").update(token).digest("hex");

  const isTokenValid = await compareToken(cryptoHash, passwordReset.token);

  if (!isTokenValid) {
    await createAuditLog({
      userId: passwordReset.userId,
      action: AuditAction.PASSWORD_RESET_INVALID,
      status: "FAILURE",
      errorMessage: "Invalid or expired reset token",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });
  }

  appAssert(
    isTokenValid,
    HttpStatus.UNAUTHORIZED,
    "Invalid or expired reset token",
  );

  await createAuditLog({
    userId: passwordReset.userId,
    action: AuditAction.PASSWORD_RESET_VERIFY,
    status: "SUCCESS",
    ipAddress: context.ip || "Unknown",
    userAgent: context.userAgent || "Unknown",
    metadata: parseUserAgent(context.userAgent),
  });

  return token;
};

export const resetUserPassword = async (
  tokenId: string,
  token: string,
  newPassword: string,
  context: RequestContext,
) => {
  const passwordReset = await prisma.passwordReset.findFirst({
    where: { id: tokenId },
  });

  if (!passwordReset) {
    await createAuditLog({
      action: AuditAction.PASSWORD_RESET_FAILED,
      status: "FAILURE",
      errorMessage: "Reset token not found",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });
  }

  appAssert(passwordReset, HttpStatus.NOT_FOUND, "Reset token not found");

  const cryptoHash = crypto.createHash("sha256").update(token).digest("hex");

  const isTokenValid = await compareToken(cryptoHash, passwordReset.token);

  if (!isTokenValid) {
    await createAuditLog({
      userId: passwordReset.userId,
      action: AuditAction.PASSWORD_RESET_FAILED,
      status: "FAILURE",
      errorMessage: "Invalid or expired reset token",
      ipAddress: context.ip || "Unknown",
      userAgent: context.userAgent || "Unknown",
      metadata: parseUserAgent(context.userAgent),
    });
  }

  appAssert(
    isTokenValid && passwordReset.expiresAt > new Date(),
    HttpStatus.UNAUTHORIZED,
    "Invalid or expired reset token",
  );

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { id: passwordReset.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.delete({
    where: { id: tokenId },
  });

  await prisma.session.deleteMany({
    where: { userId: updatedUser.id },
  });

  await createAuditLog({
    userId: updatedUser.id,
    sessionId: passwordReset.id,
    action: AuditAction.PASSWORD_RESET_SUCCESS,
    status: "SUCCESS",
    ipAddress: context.ip || "Unknown",
    userAgent: context.userAgent || "Unknown",
    metadata: parseUserAgent(context.userAgent),
  });

  return updatedUser;
};
