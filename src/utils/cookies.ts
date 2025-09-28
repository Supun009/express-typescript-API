import type { CookieOptions, Response } from "express"
import { env } from "../constant/env.js";

export type cookieParams = {
    res: Response,
    accessToken: string,
    refreshToken: string,
}

const defualt : CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",

}

export const getAccesstokenCookieOptions = () : CookieOptions => ({
    ...defualt,
    maxAge: 15 * 60 * 1000, // 15 minutes
}
);

export const getRefreshTokenCookieOptions = () : CookieOptions => ({
    ...defualt,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: '/api/auth/refresh', 
}
);

export const setCookies = ({ res, accessToken, refreshToken }: cookieParams) => {
  return  res.cookie("accessToken", accessToken, getAccesstokenCookieOptions())
.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};