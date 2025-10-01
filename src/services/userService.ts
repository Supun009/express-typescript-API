import prisma from "../config/db.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";

export async function getCurrentUser(userId: string)  {

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            role: true,
            isVeryfied: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    return user;
}

export async function updateUserInDb(userId: string, data: { name?: string; email?: string }) {

    const user = await getCurrentUser(userId);

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
    });
    return updatedUser;
}

export async function changeUserPassword(userId: string, data :{oldPassword: string, newPassword: string}) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const isPasswordMatch = await comparePassword(data.oldPassword, user.password);

    appAssert(isPasswordMatch, HttpStatus.UNAUTHORIZED, "Old password is incorrect");

    const isSamePassword = await comparePassword(data.newPassword, user.password);

    appAssert(!isSamePassword, HttpStatus.BAD_REQUEST, "New password must be different from the old password");

    const hashedPassword = await hashPassword(data.newPassword);

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    return updatedUser;
}