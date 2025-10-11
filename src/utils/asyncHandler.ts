import type { NextFunction, Request, Response } from "express";

type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default asyncHandler;
