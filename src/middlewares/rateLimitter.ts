import ratelimitter from "express-rate-limit";
import { env } from "../constant/env.js";
import type { NextFunction, Request, Response } from "express";

export const limiter = ratelimitter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = ratelimitter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

export const conditionalAuthLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.log("Skipping rate limiter for development environment");
    return next();
  }
  return authLimiter(req, res, next);
};
