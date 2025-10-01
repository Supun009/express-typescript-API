import type { User } from "../types/userType.js";

export interface UserDto {
  name: string;
  email: string;
  isVeryfies: boolean;
  role: string,
}


export const toUserDto = (user: User): UserDto => {  
    return {
        name: user.name,
        email: user.email,
        isVeryfies: user.isVeryfied,
        role: user.role,
    }
}