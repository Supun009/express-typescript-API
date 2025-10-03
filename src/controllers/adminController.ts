import { HttpStatus } from "../constant/http.js";
import Roles from "../constant/roles.js";
import { toUserDto } from "../dtos/userDto.js";
import { deleteUserById, deleteUsers, getAllUsers, getUserById, updateUserByAdmin } from "../services/adminService.js";
import appAssert from "../utils/appAssert.js";
import asyncHandler from "../utils/asyncHandler.js";
import { userData } from "./userController.js";

export const getUsersAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    console.log(userRole);

    appAssert(userRole === Roles.ADMIN, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    const users = await getAllUsers()

    return res.status(HttpStatus.OK).json({users});
});

export const getUserAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userId = req.params.id;

    appAssert(userRole === Roles.ADMIN && userId, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    const user = await getUserById(userId);

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const userDto = toUserDto(user);

    return res.status(HttpStatus.OK).json(userDto);
});

export const updateUserAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userId = req.params.id;

    appAssert(userRole === Roles.ADMIN && userId, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    const parsedData = userData.parse(req.body);

    const updatedUser =  await updateUserByAdmin(userId, parsedData);

    appAssert(updatedUser, HttpStatus.NOT_FOUND, "User not found");

    const userDto = toUserDto(updatedUser);

    return res.status(HttpStatus.OK).json(userDto);
});

export const deleteUserAdmin = asyncHandler(async(req, res) => {
    const userRole = req.user.role;
    const userId = req.params.id;
    appAssert(userRole === Roles.ADMIN && userId, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    await deleteUserById(userId);

    return res.status(HttpStatus.OK).json({
        message: "User deleted successfully",
    });
});

export const deleteUsersAdmin = asyncHandler(async(req, res) => {
    console.log(req.body);
    const userRole = req.user.role;
    const userIds : string[] = req.body.userIds;

    appAssert(userRole === Roles.ADMIN && userIds, HttpStatus.UNAUTHORIZED, "Unauthorized access");

    await deleteUsers(userIds); 

    return res.status(HttpStatus.OK).json({
        message: "Users deleted successfully",
    });
});

