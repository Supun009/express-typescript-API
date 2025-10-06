import type { ErrorRequestHandler, Response } from "express";
import { HttpStatus } from "../constant/http.js";
import z from "zod";

import AppError from "../utils/AppError.js";
import { logger } from "../../logger.js";

const handleZodError = (error: z.ZodError, res : Response) => {
    logger.error(`Zod Error: ${error.message}`);
    return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Validation Error",
        errors: error,
    });
}

const handleAppError = (error: AppError, res: Response) => {
    logger.error(`App Error: ${error.message}`);
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
    if (process.env.NODE_ENV === "development") {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error.message,
    });
    } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error"});
    }
    


}

export default errorHandler;