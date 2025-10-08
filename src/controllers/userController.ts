import z from "zod";
import { HttpStatus } from "../constant/http.js";
import { toUserDto } from "../dtos/userDto.js";
import { changeUserPassword, getCurrentUser, updateUserInDb } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const userData = z.object({
    name: z.string().min(1, "Name is required"),
    }).refine((data) => data.name, {
    message: "At least one field (name or email) must be provided",
});

const passwordSchema = z.object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmNewPassword: z.string().min(6, "Confirm new password must be at least 6 characters long"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm new password do not match",
});

export const getUser = asyncHandler(async(req, res)=> {
    const userId = req.user.userID;

    const user = await getCurrentUser(userId);

    return successResponse(res, toUserDto(user), "User profile retrieved successfully", HttpStatus.OK);
});

export const updateUser = asyncHandler(async(req, res) => {
    const userId = req.user.userID;

    const parsedData = userData.parse(req.body);

    const updatedUser = await updateUserInDb(userId, parsedData);

    return successResponse(res, toUserDto(updatedUser), "User updated successfully", HttpStatus.OK);
});


export const changePassword = asyncHandler(async(req, res) => {
    const userId = req.user.userID;

    const parsedData = passwordSchema.parse(req.body);

    await changeUserPassword(userId, parsedData);

    return successResponse(res, {}, "Password changed successfully", HttpStatus.OK);
});
