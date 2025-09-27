import prisma from "../config/db.js";

export async function getCurrentUser(userId: string)  {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            role: true,
            isVeryfies: true,
            createdAt: true,
            updatedAt: true,
        },
    });


    return user;
}