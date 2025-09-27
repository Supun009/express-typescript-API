import type { Request, Response, NextFunction } from "express";
import { verifyToken, type accessTokenPayload } from "../utils/jwt.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyToken(accessToken);

    req.user = decoded as accessTokenPayload;
    next();

}