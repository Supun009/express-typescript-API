import { th } from "zod/locales";
import AppError from "../utils/appError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { toUserDto } from "../dtos/userDto.js";
import { createToken, refreshTokenSignOptions, verifyToken, type accessTokenPayload, type refreshTokenPayload } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";

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
            role: "USER",
        },
    });

    return toUserDto(newUser);
    
}   

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

    const accessToken = createToken({ userID: session.userId, role: "USER" });

    return { accessToken, newRefreshToken };
}

