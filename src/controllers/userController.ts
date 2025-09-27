import { toUserDto } from "../dtos/userDto.js";
import { getCurrentUser } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUser = asyncHandler(async(req, res)=> {
    const userId = req.user.userID;

    const user = await getCurrentUser(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const userDto = toUserDto(user);

    res.status(200).json(userDto);
});