import prisma from "../config/db.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import { parseUserAgent, type RequestContext } from "../utils/requestContext.js";
import { AuditAction, createAuditLog } from "./auditService.js";

export async function getCurrentUser(userId: string)  {

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    return user;
}

export async function updateUserInDb(userId: string, data: { name: string}, context: RequestContext) {

    const user = await getCurrentUser(userId);

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
    });

    await createAuditLog({
        userId: updatedUser.id,
        action: AuditAction.USER_UPDATE,
        status: "SUCCESS",
        ipAddress: context.ip || 'unknown',
        userAgent: context.userAgent || 'unknown',
        metadata: parseUserAgent(context.userAgent),
    });

    return updatedUser;
}

export async function changeUserPassword(userId: string, data :{oldPassword: string, newPassword: string}, context: RequestContext) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const isPasswordMatch = await comparePassword(data.oldPassword, user.password);

    appAssert(isPasswordMatch, HttpStatus.UNAUTHORIZED, "Old password is incorrect");

    const isSamePassword = await comparePassword(data.newPassword, user.password);

    appAssert(!isSamePassword, HttpStatus.BAD_REQUEST, "New password must be different from the old password");

    const hashedPassword = await hashPassword(data.newPassword);

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    await createAuditLog({
        userId: updatedUser.id,
        action: AuditAction.PASSWORD_CHANGE_SUCCESS,
        status: "SUCCESS",
        ipAddress: context.ip || 'unknown',
        userAgent: context.userAgent || 'unknown',
        metadata: parseUserAgent(context.userAgent),
    });

    return updatedUser;
}