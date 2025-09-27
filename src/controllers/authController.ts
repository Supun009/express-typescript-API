import z, { email } from "zod";
import asyncHandler from "../utils/asyncHandler.js";
import { loginUser, refreshAccessToken, registerUser } from "../services/authService.js";
import { HttpStatus } from "../constant/http.js";
import { getAccesstokenCookieOptions, setCookies } from "../utils/cookies.js";
import appAssert from "../utils/appAssert.js";

const logi = z.object({
    email: z.string().check(email("Invalid email format")),
    password: z.string().min(6, "Password must be at least 6 characters long"),
}).refine((data => data.password.length >= 6), {
    message: "Password must be at least 6 characters long",
    path: ["password"],
});

const reg = z.object({
    email: z.string().check(email("Invalid email format")),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",  
    path: ["confirmPassword"],
});



export const login = asyncHandler(async(req, res)=> {
    const parsedData = logi.parse(req.body);

    if (parsedData) {
        const {accessToken, refreshToken} = await loginUser(parsedData);
        return setCookies({res, accessToken, refreshToken}).status(HttpStatus.OK).json({
            message: "Login successful",
        });
      
    }
    
});

export const register = asyncHandler(async(req, res)=> {
    const parsedData = reg.parse(req.body);

    if (parsedData) {
        await registerUser(parsedData);
        return res.status(HttpStatus.CREATED).json({
            message: "Registration successful",
        
        });
    }

}); 

export const refresUserToken = asyncHandler(async(req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    appAssert(refreshToken, HttpStatus.UNAUTHORIZED, "Refresh token not found");

    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);

    if (newRefreshToken) {
        setCookies({ res, accessToken, refreshToken: newRefreshToken });
    }

    return res.status(HttpStatus.OK).cookie("accessToken", accessToken, getAccesstokenCookieOptions()).json({message: "Token refreshed"});
});