import { HttpStatus } from "../constant/http.js";
import Roles from "../constant/roles.js";
import { toUserDtoAdmin } from "../dtos/userdtoAdmin.js";
import { deleteUserById, deleteUsers, getAllUsers, getUserById, updateUserByAdmin } from "../services/adminService.js";
import { successResponse } from "../utils/apiResponse.js";
import appAssert from "../utils/appAssert.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getRequestContext } from "../utils/requestContext.js";
import { userData } from "./userController.js";

export const getUsersAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;

    appAssert(userRole === Roles.ADMIN, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    const users = await getAllUsers()

    return successResponse(res, users, "Users retrieved successfully", HttpStatus.OK);

});

export const getUserAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userId = req.params.id;

    appAssert(userRole === Roles.ADMIN && userId, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    const user = await getUserById(userId);

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    return successResponse(res, toUserDtoAdmin(user), "User retrieved successfully", HttpStatus.OK);
});

export const updateUserAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userId = req.params.id;

    const context = getRequestContext(req);

    appAssert(userRole === Roles.ADMIN && userId, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    const parsedData = userData.parse(req.body);

    const updatedUser =  await updateUserByAdmin(userId, parsedData, context);

    appAssert(updatedUser, HttpStatus.NOT_FOUND, "User not found");

    return successResponse(res, toUserDtoAdmin(updatedUser), "User updated successfully", HttpStatus.OK);
});

export const deleteUserAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userId = req.params.id;

    const context = getRequestContext(req);

    appAssert(userRole === Roles.ADMIN && userId, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    await deleteUserById(userId, context);

    return successResponse(res, {}, "User deleted successfully", HttpStatus.OK);
});

export const deleteUsersAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userIds : string[] = req.body.userIds;

    const context = getRequestContext(req);

    appAssert(userRole === Roles.ADMIN && userIds, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    await deleteUsers(userIds, context); 

    return successResponse(res, {}, "Users deleted successfully", HttpStatus.OK);
});

