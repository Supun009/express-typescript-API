// src/services/auditService.ts
import prisma from "../config/db.js";
import { parseUserAgent } from "../utils/requestContext.js";
import { logger } from "../../logger.js";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export enum AuditAction {
    // Authentication
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILED = "LOGIN_FAILED",
    LOGOUT = "LOGOUT",
    LOGOUT_FAILD = "LOGOUT_FAILD",
    REGISTER = "REGISTER",
    TOKEN_REFRESH = "TOKEN_REFRESH",
    
    // Password
    PASSWORD_CHANGE_SUCCESS = "PASSWORD_CHANGE_SUCCESS",
    PASSWORD_CHANGE_FAILED = "PASSWORD_CHANGE_FAILED",
    PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
    PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",
    PASSWORD_RESET_FAILED = "PASSWORD_RESET_FAILED",
    PASSWORD_RESET_VERIFY = "PASSWORD_RESET_VERIFY",
    PASSWORD_RESET_EXPIRE = "PASSWORD_RESET_EXPIRE",
    PASSWORD_RESET_INVALID = "PASSWORD_RESET_INVALID",
    
    // User Management
    USER_UPDATE = "USER_UPDATE",
    USER_DELETE = "USER_DELETE",
    USER_VIEW = "USER_VIEW",
    
    // Admin Actions
    ADMIN_USER_UPDATE = "ADMIN_USER_UPDATE",
    ADMIN_USER_DELETE = "ADMIN_USER_DELETE",
    ADMIN_USERS_VIEW = "ADMIN_USERS_VIEW",
}

export interface AuditLogData {
    userId?: string;
    sessionId?: string;
    action: AuditAction;
    resource?: string;
    resourceId?: string;
    ipAddress: string;
    userAgent: string;
    status: "SUCCESS" | "FAILURE";
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Create audit log entry
 */
export const createAuditLog = async (data: AuditLogData): Promise<void> => {
    try {
        const deviceInfo = parseUserAgent(data.userAgent);

        await prisma.auditLog.create({
            data: {
                userId: data.userId ?? null,
                sessionId: data.sessionId ?? null,
                action: data.action,
                resource: data.resource ?? null,
                resourceId: data.resourceId ?? null,
                userAgent: data.userAgent,
                ipAddress: data.ipAddress,
                deviceInfo: deviceInfo ?? null,
                status: data.status,
                errorMessage: data.errorMessage ?? null,
                metadata: data.metadata as InputJsonValue ?? null,
            },
        });

        // Log to console/file for immediate tracking
        logger.info({
            audit: true,
            action: data.action,
            userId: data.userId,
            ip: data.ipAddress,
            status: data.status,
        }, `Audit: ${data.action}`);
    } catch (error) {
        // Don't throw - audit logging shouldn't break the app
        logger.error(`Failed to create audit log: ${error}`);
    }
};

/**
 * Get audit logs for a user (for security dashboard)
 */
export const getUserAuditLogs = async (
    userId: string,
    limit: number = 50
) => {
    return prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            action: true,
            ipAddress: true,
            deviceInfo: true,
            status: true,
            createdAt: true,
        },
    });
};

/**
 * Get suspicious activity (multiple failed logins)
 */
export const getSuspiciousActivity = async (
    ipAddress: string,
    timeWindow: number = 15 // minutes
) => {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);

    const failedAttempts = await prisma.auditLog.count({
        where: {
            ipAddress,
            action: AuditAction.LOGIN_FAILED,
            status: "FAILURE",
            createdAt: { gte: since },
        },
    });

    return failedAttempts;
};

/**
 * Get all active sessions for a user
 */
export const getUserActiveSessions = async (userId: string) => {
    return prisma.session.findMany({
        where: {
            userId,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            userAgent: true,
            createdAt: true,
            updatedAt: true,
            expiresAt: true,
        },
    });
};