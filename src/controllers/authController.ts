import asyncHandler from "../utils/asyncHandler.js";
import { createResetToken, loginUser, logoutUser, refreshAccessToken, registerUser, resetUserPassword } from "../services/authService.js";
import { HttpStatus } from "../constant/http.js";
import { getAccesstokenCookieOptions, getRefreshTokenCookieOptions, setCookies } from "../utils/cookies.js";
import appAssert from "../utils/appAssert.js";
import { verifyToken, type accessTokenPayload } from "../utils/jwt.js";
import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { getRequestContext } from "../utils/requestContext.js";
import { logi, passwordSchema, reg } from "../utils/authValidator.js";





export const login = asyncHandler(async(req, res)=> {
    const parsedData = logi.parse(req.body);

    const context = getRequestContext(req);

    if (parsedData) {
        const {accessToken, refreshToken} = await loginUser(parsedData, context );
        
        setCookies({res, accessToken, refreshToken});

        return successResponse(res, {}, "Login successful", HttpStatus.OK); 
    }
});

export const register = asyncHandler(async(req, res)=> {
    const parsedData = reg.parse(req.body);

        const context = getRequestContext(req);

    if (parsedData) {
        await registerUser(parsedData, context);
        return successResponse(res, {}, "Registration successful", HttpStatus.CREATED);
    }

}); 

export const logout = asyncHandler(async(req, res)=> {
    const accessToken = req.cookies?.accessToken;

    const context = getRequestContext(req);

    appAssert(accessToken, HttpStatus.UNAUTHORIZED, "User not authenticated");

    const decoded = verifyToken(accessToken) as accessTokenPayload;

    await logoutUser(decoded.sessionId, context.ip, context.userAgent);

    res.clearCookie("accessToken", getAccesstokenCookieOptions()).
    clearCookie("refreshToken", getRefreshTokenCookieOptions());

    return successResponse(res, {}, "Logout successful", HttpStatus.OK); 
});

export const refresUserToken = asyncHandler(async(req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    const context = getRequestContext(req);

    appAssert(refreshToken, HttpStatus.UNAUTHORIZED, "Refresh token not found");

    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken, context);

    if (newRefreshToken) {
        setCookies({ res, accessToken, refreshToken: newRefreshToken });
    }

    res.cookie("accessToken", accessToken, getAccesstokenCookieOptions());

    return successResponse(res, {}, "Token refreshed successfully", HttpStatus.OK);
    
});

export const getResetToken = asyncHandler(async(req, res) => {
    const {email} = req.body;

    const context = getRequestContext(req);

    appAssert(email, HttpStatus.BAD_REQUEST, "Email is required");

    const token = await createResetToken(email, context);

    return successResponse(res, token, "Reset token created successfully", HttpStatus.CREATED);
});


export const resetPassword = asyncHandler(async(req, res) => {
    const {token, id} = req.body;

    const context = getRequestContext(req);

    appAssert(token && typeof token === "string" && id && typeof id === "string", HttpStatus.BAD_REQUEST, "Token and id are required");

    const parsedData = passwordSchema.parse(req.body);

    await resetUserPassword( id, token, parsedData.password, context);

    res.clearCookie("accessToken", getAccesstokenCookieOptions()).
    
    clearCookie("refreshToken", getRefreshTokenCookieOptions());

    return successResponse(res, {}, "Password has been reset successfully", HttpStatus.OK);
});

