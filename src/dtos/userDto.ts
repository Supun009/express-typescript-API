import type { UserDocument } from "../models/userModel.js";

export interface UserDto {
  _id: string;
  email: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export const toUserDto = (user: UserDocument): UserDto => {  
    return {
        _id: user._id.toString(),
        email: user.email,
        verified: user.isVeryfies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}