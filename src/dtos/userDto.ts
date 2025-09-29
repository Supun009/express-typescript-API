
export interface UserDto {
  name: string;
  email: string;
  isVeryfies: boolean;
  role: string,
  createdAt: Date;
  updatedAt: Date;
}


export const toUserDto = (user: UserDto): UserDto => {  
    return {
        name: user.name,
        email: user.email,
        isVeryfies: user.isVeryfies,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}