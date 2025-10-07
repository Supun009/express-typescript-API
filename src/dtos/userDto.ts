import type { User } from "../types/userType.js";

export interface UserDto {
  name: string;
  email: string;
  isVeryfied: boolean;
  role: string,
}


export const toUserDto = (user: User): UserDto => {  
    return {
        name: user.name,
        email: user.email,
        isVeryfied: user.isVerified,
        role: user.role,
    }
}