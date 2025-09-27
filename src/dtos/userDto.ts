
export interface UserDto {
  email: string;
  isVeryfies: boolean;
  role: string,
  createdAt: Date;
  updatedAt: Date;
}


export const toUserDto = (user: UserDto): UserDto => {  
    return {
        email: user.email,
        isVeryfies: user.isVeryfies,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}