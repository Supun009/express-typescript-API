import z, { email } from "zod";
import asyncHandler from "../utils/asyncHandler.js";
import { createResetToken, loginUser, logoutUser, refreshAccessToken, registerUser, resetUserPassword } from "../services/authService.js";
import { HttpStatus } from "../constant/http.js";
import { getAccesstokenCookieOptions, getRefreshTokenCookieOptions, setCookies } from "../utils/cookies.js";
import appAssert from "../utils/appAssert.js";
import { verifyToken, type accessTokenPayload } from "../utils/jwt.js";

const logi = z.object({
    email: z.string().check(email("Invalid email format")),
    password: z.string().min(6, "Password must be at least 6 characters long"),
}).refine((data => data.password.length >= 6), {
    message: "Password must be at least 6 characters long",
    path: ["password"],
});

const passwordSchema = z.object({
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",  
        path: ["confirmPassword"],
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

export const logout = asyncHandler(async(req, res)=> {
    const accessToken = req.cookies?.accessToken;

    appAssert(accessToken, HttpStatus.UNAUTHORIZED, "User not authenticated");

    const decoded = verifyToken(accessToken) as accessTokenPayload;

    await logoutUser(decoded.sessionId);

    return res.clearCookie("accessToken", getAccesstokenCookieOptions()).
    clearCookie("refreshToken", getRefreshTokenCookieOptions()).json({message: "Logged out"}); 
});

export const refresUserToken = asyncHandler(async(req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    appAssert(refreshToken, HttpStatus.UNAUTHORIZED, "Refresh token not found");

    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);

    if (newRefreshToken) {
        setCookies({ res, accessToken, refreshToken: newRefreshToken });
    }

    return res.status(HttpStatus.OK).cookie("accessToken", accessToken, getAccesstokenCookieOptions())
    .json({message: "Token refreshed"});
});

export const getResetToken = asyncHandler(async(req, res) => {
    const {email} = req.body;

    appAssert(email, HttpStatus.BAD_REQUEST, "Email is required");

    const token = await createResetToken(email);

    return res.status(HttpStatus.OK).json({message: "Password reset link sent to your email",  token});
});


export const resetPassword = asyncHandler(async(req, res) => {
    const {token, id} = req.body;

    appAssert(token && typeof token === "string" && id && typeof id === "string", HttpStatus.BAD_REQUEST, "Token and id are required");

    const parsedData = passwordSchema.parse(req.body);

    await resetUserPassword( id, token, parsedData.password);

    return res.clearCookie("accessToken", getAccesstokenCookieOptions()).
    clearCookie("refreshToken", getRefreshTokenCookieOptions()).
    status(HttpStatus.OK).json({ message: "Password has been reset successfully" });
});