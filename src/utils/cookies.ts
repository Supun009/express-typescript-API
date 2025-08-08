import type { Response } from "express"

export type cookieParams = {
    res: Response,
    accessToken: string,
    refreshToken: string,
}

export const setCookies = ({ res, accessToken, refreshToken }: cookieParams) => {
  return  res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    })
.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
};