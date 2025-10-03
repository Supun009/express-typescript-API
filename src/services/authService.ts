import AppError from "../utils/appError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { toUserDto } from "../dtos/userDto.js";
import { createToken, refreshTokenSignOptions, verifyToken, type accessTokenPayload, type refreshTokenPayload } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import crypto from "crypto";
import { compareToken, hashToken } from "../utils/hashToken.js";
import Roles from "../constant/roles.js";


export type LoginUSerType  = {
    email: string;
    password: string;
    userAgent?: string; 
};

export type RegisterUserType = {
    name: string;
    email: string;
    password: string;
    
} 

export const loginUser = async (user: LoginUSerType) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    })

    if(!existingUser) {
        appAssert(existingUser, HttpStatus.NOT_FOUND, "User not found");
    }
    const isPasswordMatch = await comparePassword(user.password, existingUser.password);

    if (!isPasswordMatch) {
        throw new AppError(HttpStatus.BAD_REQUEST,"Invalid password");
    }

    const session = await prisma.session.create({
        data: {
            userId: existingUser.id,     
            userAgent: user.userAgent || "Unknown",
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
    return {accessToken, refreshToken};
    }

    
export const registerUser = async(user:RegisterUserType)=> {
    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    });
    if (existingUser)  {
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

    return toUserDto(newUser);
    
}   

export const logoutUser = async(id: string) => {
const sessionID = await prisma.session.findFirst({
    where: { id },
});

appAssert(sessionID, HttpStatus.NOT_FOUND, "Session not found");

await prisma.session.delete({
    where: { id },
});
};

export const refreshAccessToken = async (token: string)=> {
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

    const accessToken = createToken({ userID: session.userId, role: "USER" , sessionId: session.id});

    return { accessToken, newRefreshToken };
}

export const createResetToken = async(email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await hashToken(resetToken);

    const passwordReset = await prisma.passwordReset.create({
        data: {
            id: crypto.randomUUID(),
            userId: user.id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
    });


    return  {id:passwordReset.id, resetToken};
}

export const verifyResetToken = async(token: string, id: string): Promise<string> => {
    const passwordReset = await prisma.passwordReset.findFirst({
        where: { id },
        orderBy: { createdAt: "desc" },
    });

    appAssert(passwordReset, HttpStatus.NOT_FOUND, "Reset token not found");

    const isTokenValid = await compareToken(token, passwordReset.token);

    appAssert(isTokenValid, HttpStatus.UNAUTHORIZED, "Invalid or expired reset token");

    return token;
}

export const resetUserPassword = async(tokenId: string, token: string, newPassword: string) => {

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

    return updatedUser;
}
