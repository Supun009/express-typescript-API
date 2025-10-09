import { HttpStatus } from "../constant/http.js";
import Roles from "../constant/roles.js";
import { toUserDtoAdmin } from "../dtos/userdtoAdmin.js";
import {
  deleteUserById,
  deleteUsers,
  getAllUsers,
  getUserById,
  revokeSessionByAdmin,
  updateUserByAdmin,
} from "../services/adminService.js";
import { successResponse } from "../utils/apiResponse.js";
import appAssert from "../utils/appAssert.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getRequestContext } from "../utils/requestContext.js";
import { userData } from "./userController.js";

export const getUsersAdmin = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  appAssert(
    userRole === Roles.ADMIN,
    HttpStatus.UNAUTHORIZED,
    "Unauthorized access"
  );

  const users = await getAllUsers();

  return successResponse(
    res,
    users,
    "Users retrieved successfully",
    HttpStatus.OK
  );
});

export const getUserAdmin = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userId = req.params.id;

  appAssert(
    userRole === Roles.ADMIN && userId,
    HttpStatus.UNAUTHORIZED,
    "Unauthorized access"
  );

  const user = await getUserById(userId);

  appAssert(user, HttpStatus.NOT_FOUND, "User not found");

  return successResponse(
    res,
    toUserDtoAdmin(user),
    "User retrieved successfully",
    HttpStatus.OK
  );
});

export const updateUserAdmin = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const adminId = req.user.userID;
  const userId = req.params.id;

  const context = getRequestContext(req);

  appAssert(
    userRole === Roles.ADMIN && userId,
    HttpStatus.UNAUTHORIZED,
    "Unauthorized access"
  );

  const parsedData = userData.parse(req.body);

  const updatedUser = await updateUserByAdmin(
    adminId,
    userId,
    parsedData,
    context
  );

  return successResponse(
    res,
    toUserDtoAdmin(updatedUser),
    "User updated successfully",
    HttpStatus.OK
  );
});

export const deleteUserAdmin = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const adminId = req.user.userID;
  const userId = req.params.id;
  const context = getRequestContext(req);

  appAssert(
    userRole === Roles.ADMIN && userId,
    HttpStatus.UNAUTHORIZED,
    "Unauthorized access"
  );

  await deleteUserById(adminId, userId, context);

  return successResponse(res, {}, "User deleted successfully", HttpStatus.OK);
});

export const deleteUsersAdmin = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const adminId = req.user.userID;
  const userIds: string[] = req.body.userIds;

  const context = getRequestContext(req);

  appAssert(
    userRole === Roles.ADMIN && userIds,
    HttpStatus.UNAUTHORIZED,
    "Unauthorized access"
  );

  await deleteUsers(adminId, userIds, context);

  return successResponse(res, {}, "Users deleted successfully", HttpStatus.OK);
});

export const revokeUserSessionAdmin = asyncHandler(async (req, res) => {
    const userRole = req.user.role;
    const adminId = req.user.userID;
    const sessionId = req.params.sessionId;
    const context = getRequestContext(req);

    appAssert(
        userRole === Roles.ADMIN,
        HttpStatus.UNAUTHORIZED,
        "Unauthorized access"
    );

    appAssert(sessionId, HttpStatus.BAD_REQUEST, "Session ID is required");

    await revokeSessionByAdmin(adminId, sessionId, context);

    return successResponse(res, {}, "Session revoked successfully by admin", HttpStatus.OK);
});
