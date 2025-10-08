import AppError from "../utils/AppError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { toUserDto } from "../dtos/userDto.js";
import { createToken, refreshTokenSignOptions, verifyToken, type accessTokenPayload, type refreshTokenPayload } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import crypto from "crypto";
import { compareToken, hashToken } from "../utils/hashToken.js";
import Roles from "../constant/roles.js";
import { AuditAction, createAuditLog } from "./auditService.js";
import type { RequestContext } from "../utils/requestContext.js";


export type LoginUSerType  = {
    email: string;
    password: string;
    reqContext?: RequestContext; 
};

export type RegisterUserType = {
    name: string;
    email: string;
    password: string;
    reqContext: RequestContext
    
} 

export const loginUser = async (user: LoginUSerType) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    })

    if(!existingUser) {
        await createAuditLog({action: AuditAction.LOGIN_FAILED,
            status: "FAILURE",
            errorMessage: "User not found",
            ipAddress: user.reqContext?.ip || "Unknown",
            userAgent: user.reqContext?.userAgent || "Unknown"
            });

        appAssert(existingUser, HttpStatus.NOT_FOUND, "User not found");
    }
    const isPasswordMatch = await comparePassword(user.password, existingUser.password);

    if (!isPasswordMatch) {
        await createAuditLog({
                userId: existingUser.id,
                action: AuditAction.LOGIN_FAILED,
                ipAddress: user.reqContext?.ip || 'unknown',
                userAgent: user.reqContext?.userAgent || 'unknown',
                status: "FAILURE",
                errorMessage: "Invalid password",
            });
        throw new AppError(HttpStatus.BAD_REQUEST,"Invalid password");
    }

    const session = await prisma.session.create({
        data: {
            userId: existingUser.id, 
            role: existingUser.role,
            userAgent: user.reqContext?.userAgent || "Unknown",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }   
    });

    const accessTokenPayload : accessTokenPayload= {
        userID: existingUser.id,
        role: existingUser.role,
        sessionId: session.id,
    };

    const refreshTokenPayload : refreshTokenPayload = {
        sessionId: session.id,
        userId: existingUser.id,
    };



    const accessToken =  createToken(accessTokenPayload );

    const refreshToken =  createToken(refreshTokenPayload, refreshTokenSignOptions );


    if (!accessToken || !refreshToken) {
        appAssert(!accessToken || !refreshToken, HttpStatus.INTERNAL_SERVER_ERROR, "Token generation failed");
    }
    await createAuditLog({
            userId: existingUser.id,
            sessionId: session.id,
            action: AuditAction.LOGIN_SUCCESS,
            ipAddress: user.reqContext?.ip || 'unknown',
            userAgent: user.reqContext?.userAgent || 'unknown',
            status: "SUCCESS",
        });
    return {accessToken, refreshToken};
    }

    
export const registerUser = async(user:RegisterUserType)=> {
    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    });
    if (existingUser)  {
        await createAuditLog({
            action: AuditAction.REGISTER,
            status: "FAILURE",
            errorMessage: "User already exists",
            ipAddress: user.reqContext?.ip || "Unknown",
            userAgent: user.reqContext?.userAgent || "Unknown",
        });
        appAssert(!existingUser, HttpStatus.CONFLICT, "User already exists");
    }

    const hashedPassword = await hashPassword(user.password);

    const newUser = await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: Roles.USER,
        },
    });

    await createAuditLog({
        action: AuditAction.REGISTER,
        status: "SUCCESS",
        ipAddress: user.reqContext?.ip || "Unknown",
        userAgent: user.reqContext?.userAgent || "Unknown",
    });

    return toUserDto(newUser);
    
}   

export const logoutUser = async(id: string, ip?: string, userAgent?: string) => {
    const sessionID = await prisma.session.findFirst({
        where: { id },
    });

    if (!sessionID) {
        await createAuditLog({
            action: AuditAction.LOGOUT_FAILD,
            status: "FAILURE",
            ipAddress: ip || "Unknown",
            userAgent: userAgent || "Unknown",   
        });   
    }
        

    appAssert(sessionID, HttpStatus.NOT_FOUND, "Session not found");

    await prisma.session.delete({
        where: { id },
    });

    await createAuditLog({
            action: AuditAction.LOGOUT,
            status: "SUCCESS",
            ipAddress: ip || "Unknown",
            userAgent: userAgent || "Unknown",  
        });
};

export const refreshAccessToken = async (token: string, context: RequestContext)=> {
    const decoded = verifyToken(token, refreshTokenSignOptions);

    appAssert(decoded, HttpStatus.UNAUTHORIZED, "Invalid refresh token");

    const sessionId = decoded.sessionId;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
    });

    appAssert(session && session.expiresAt > new Date(), HttpStatus.UNAUTHORIZED, "Session expired");

    const sessionNeedsUpdate = session.updatedAt < new Date(Date.now() -2 * 24 * 60 * 60 * 1000);

    if (sessionNeedsUpdate) {
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }

    const newRefreshToken = sessionNeedsUpdate ? createToken({ sessionId: session.id, userId: session.userId }, refreshTokenSignOptions) : undefined;

    const accessToken = createToken({ userID: session.userId, role: session.role , sessionId: session.id});

    await createAuditLog({
        userId: session.userId,
        sessionId: session.id,
        action: AuditAction.TOKEN_REFRESH,
        status: "SUCCESS",
        ipAddress: context.userAgent || "Unknown",
        userAgent: context.userAgent || "Unknown",
    });

    return { accessToken, newRefreshToken };
}

export const createResetToken = async(email: string, reqContext?: RequestContext) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");

    const cryptoHash = crypto.createHash('sha256').update(resetToken).digest('hex');

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
        ipAddress: reqContext?.ip || "Unknown",
        userAgent: reqContext?.userAgent || "Unknown",
    });

    return  {id:passwordReset.id, resetToken};
}

export const verifyResetToken = async(token: string, id: string, context: RequestContext): Promise<string> => {
    const passwordReset = await prisma.passwordReset.findFirst({
        where: { id },
        orderBy: { createdAt: "desc" },
    });

    appAssert(passwordReset, HttpStatus.NOT_FOUND, "Reset token not found");

    const isTokenValid = await compareToken(token, passwordReset.token);

    appAssert(isTokenValid, HttpStatus.UNAUTHORIZED, "Invalid or expired reset token");

    await createAuditLog({
        userId: passwordReset.userId,
        action: AuditAction.PASSWORD_RESET_VERIFY,
        status: "SUCCESS",
        ipAddress: context.ip || "Unknown",
        userAgent: context.userAgent || "Unknown",
    });

    return token;
}

export const resetUserPassword = async(tokenId: string, token: string, newPassword: string, context: RequestContext) => {

    const passwordReset = await prisma.passwordReset.findFirst({
        where: { id: tokenId },
    });

    appAssert(passwordReset, HttpStatus.NOT_FOUND, "Reset token not found");

    const isTokenValid = await compareToken(token, passwordReset.token);

    appAssert(isTokenValid && passwordReset.expiresAt > new Date(), HttpStatus.UNAUTHORIZED, "Invalid or expired reset token");

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
        action: AuditAction.PASSWORD_RESET,
        status: "SUCCESS",
        ipAddress: context.ip || "Unknown",
        userAgent: context.userAgent || "Unknown",
    });

    return updatedUser;
}
