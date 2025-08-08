import type { ErrorRequestHandler, Response } from "express";
import { HttpStatus } from "../constant/http.js";
import z from "zod";
import { env } from "../constant/env.js";
import AppError from "../utils/appError.js";

const handleZodError = (error: z.ZodError, res : Response) => {
    console.log(`Zod Error: ${error.message}`);
    return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Validation Error",
        errors: error,
    });
}

const handleAppError = (error: AppError, res: Response) => {
    console.log(`App Error: ${error.message}`);
    return res.status(error.statusCode).json({
        message: error.message,
    });
}

const  errorHandler : ErrorRequestHandler = (error, req, res, next) => {

    if (error instanceof z.ZodError) {
      return handleZodError(error, res);
        
    } if (error instanceof AppError) {
        return handleAppError(error, res);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error.message,
    });


}

export default errorHandler;