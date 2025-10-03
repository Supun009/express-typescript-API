import type { User } from "../generated/prisma/index.js";

export interface UserDtoAdmin {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        isDeleted: boolean;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }  
    
export const toUserDtoAdmin = (user: Omit<User, "password">): UserDtoAdmin => {  
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isDeleted: user.isDeleted,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}   