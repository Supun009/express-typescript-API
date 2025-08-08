import { th } from "zod/locales";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { toUserDto } from "../dtos/userDto.js";
import { createToken } from "../utils/jwt.js";

export type LoginUSerType  = {
    email: string;
    password: string;
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

    const token = await createToken({ id: existingUser._id }, process.env.JWT_SECRET || "defaultSecret");

    if (!token) {
        appAssert(!token, HttpStatus.INTERNAL_SERVER_ERROR, "Token generation failed");
    }
    return token;
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
