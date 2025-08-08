import { th } from "zod/locales";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { toUserDto } from "../dtos/userDto.js";
import { createToken, refreshTokenSignOptions, type accessTokenPayload, type refreshTokenPayload } from "../utils/jwt.js";
import Session from "../models/sesionModel.js";

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
    const existingUser = await User.findOne({ email: user.email });

    if(!existingUser) {
        appAssert(existingUser, HttpStatus.NOT_FOUND, "User not found");
    }
    const isPasswordMatch = await existingUser.matchPassword(user.password);

    if (!isPasswordMatch) {
        throw new AppError(HttpStatus.BAD_REQUEST,"Invalid password");
    }

    const session = await Session.create({
        userId: existingUser._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: user.userAgent || undefined, 
    });

    const accessTokenPayload : accessTokenPayload= {
        userID: existingUser._id,
        role: existingUser.role,
    };

    const refreshTokenPayload : refreshTokenPayload = {
        sessionId: session._id,
        userId: existingUser._id,
    };



    const accessToken =  createToken(accessTokenPayload );

    const refreshToken =  createToken(refreshTokenPayload, refreshTokenSignOptions );


    if (!accessToken || !refreshToken) {
        appAssert(!accessToken || !refreshToken, HttpStatus.INTERNAL_SERVER_ERROR, "Token generation failed");
    }
    return {accessToken, refreshToken};
    }

export const registerUser = async(user:RegisterUserType)=> {
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser)  {
        appAssert(!existingUser, HttpStatus.CONFLICT, "User already exists");
    }

    const newUser = await User.create({
        name: user.name,
        email: user.email,
        password: user.password,
    }); 

    return toUserDto(newUser);
    
}    
