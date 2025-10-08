import type { ErrorRequestHandler, Response } from "express";
import { HttpStatus } from "../constant/http.js";
import z from "zod";

import AppError from "../utils/AppError.js";
import { logger } from "../../logger.js";
import { errorResponse } from "../utils/apiResponse.js";

const handleZodError = (error: z.ZodError, res : Response) => {
    logger.error(`Zod Error: ${error.message}`);

    const errors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
    }));

    return errorResponse(res, "Validation Error", HttpStatus.BAD_REQUEST, errors);
}

const handleAppError = (error: AppError, res: Response) => {
    logger.error(`App Error: ${error.message}`);
    return errorResponse(res, error.message, error.statusCode);
}

const  errorHandler : ErrorRequestHandler = (error, req, res, next) => {

    if (error instanceof z.ZodError) {
      return handleZodError(error, res);
        
    } if (error instanceof AppError) {
        return handleAppError(error, res);
    }
    if (process.env.NODE_ENV === "development") {
        return errorResponse(res, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
        return errorResponse(res, "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    


}

export default errorHandler;