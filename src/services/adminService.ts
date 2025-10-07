import prisma from "../config/db.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";

export const getAllUsers = async() => {

    const users = await prisma.user.findMany(
        {
            where: { isDeleted: false },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        }
    );

    return users;
};

export const getUserById = async(userId: string)  => {

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isDeleted: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};  


export const updateUserByAdmin = async(userId: string, data: { name: string}) => {

    const user = await getUserById(userId);

    appAssert(user, HttpStatus.NOT_FOUND, "User not found");

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
    });
    return updatedUser;
};

export const deleteUserById = async(userId: string) => {

   await prisma.user.update({
        where: { id: userId },
        data: {
            isDeleted: true,
        },
    });
};  

export const deleteUsers = async(userIds: string[]) => {
    await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: {
            isDeleted: true,
        },
    });
};

