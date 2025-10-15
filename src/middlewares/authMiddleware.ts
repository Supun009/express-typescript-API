import type { Request, Response, NextFunction } from "express";
import { verifyToken, type accessTokenPayload } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { HttpStatus } from "../constant/http.js";
import appAssert from "../utils/appAssert.js";
import { findSessionById } from "../services/sessionService.js";
import { clearCookies } from "../utils/cookies.js";

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken: string | undefined = req.cookies?.accessToken;

    if (!accessToken) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Access token not found");
    }

    const decoded = verifyToken(accessToken);

    if (!decoded) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid access token");
    }

    // Check if the session is still valid in the database
    const session = await findSessionById(decoded.sessionId);
    if (!session) {
      clearCookies(res);
      appAssert(false, HttpStatus.UNAUTHORIZED, "Session not found");
    }

    // CSRF Protection: For any method that is not 'safe' (GET, HEAD, OPTIONS),
    // we require a CSRF token to be sent in the headers. This token must match
    // the one stored in the JWT payload.
    // const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];
    // if (unsafeMethods.includes(req.method)) {
    //   const csrfTokenFromHeader = req.headers["x-csrf-token"] as string;
    //   const csrfTokenFromJwt = decoded.csrfToken;

    //   if (!csrfTokenFromHeader || csrfTokenFromHeader !== csrfTokenFromJwt) {
    //     throw new AppError(HttpStatus.FORBIDDEN, "Invalid CSRF token");
    //   }
    // }

    req.user = decoded as accessTokenPayload;
    next();
  },
);
