import type { Request, Response, NextFunction } from "express";
import { verifyToken, type accessTokenPayload } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { HttpStatus } from "../constant/http.js";

export const authMiddleware = asyncHandler(async(req: Request, res: Response, next: NextFunction)=> {
    const accessToken = req.cookies?.accessToken;
    console.log(accessToken);

    if (!accessToken) {
        console.log("Access token not found");
        throw new AppError(HttpStatus.UNAUTHORIZED, "Access token not found");
    }

    const decoded = verifyToken(accessToken);

    if (!decoded) {
        throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid access token");
    }

    req.user = decoded as accessTokenPayload;
    next();
});
    
