import z, { email } from "zod";
import { HttpStatus } from "../constant/http.js";
import { toUserDto } from "../dtos/userDto.js";
import { changeUserPassword, getCurrentUser, updateUserInDb } from "../services/userService.js";
import appAssert from "../utils/appAssert.js";
import asyncHandler from "../utils/asyncHandler.js";
import { comparePassword } from "../utils/hashPassword.js";

const userData = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().check(email("Invalid email format")),
}).refine((data) => data.name && data.email, {
    message: "At least one field (name or email) must be provided",
});

const password = z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmNewPassword: z.string().min(6, "Confirm new password must be at least 6 characters long"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm new password do not match",
});

export const getUser = asyncHandler(async(req, res)=> {
    const userId = req.user.userID;

    const user = await getCurrentUser(userId);

    const userDto = toUserDto(user);

    return res.status(HttpStatus.OK).json(userDto);
});

export const updateUser = asyncHandler(async(req, res) => {
    const userId = req.user.userID;

    const parsedData = userData.parse(req.body);

    const updatedUser = await updateUserInDb(userId, parsedData);

    return res.status(HttpStatus.OK).json(toUserDto(updatedUser));
});


export const changePassword = asyncHandler(async(req, res) => {
    const userId = req.user.userID;

    const parsedData = password.parse(req.body);

    await changeUserPassword(userId, parsedData);

    return res.status(HttpStatus.OK).json({
        message: "Password changed successfully",
    });

});