import type { Response } from "express";
import { HttpStatus } from "../constant/http.js";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    feild?: string;
    message: string;
  }>;
  meta?: {
    timestamp: string;
    path?: string;
    [key: string]: any;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: HttpStatus = HttpStatus.OK,
  meta?: Record<string, any>,
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message: message || "Request successful",
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(response);
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  statusCode: HttpStatus = HttpStatus.OK,
): Response => {
  const response: ApiResponse<T[]> = {
    success: true,
    message: message || "Request successful",
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination,
    },
  };

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  errors?: Array<{ field?: string; message: string }>,
  meta?: Record<string, any>,
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors: errors || [],
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(response);
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message?: string,
): Response => {
  return successResponse(
    res,
    data,
    message || "Resource created successfully",
    HttpStatus.CREATED,
  );
};

export const noContentResponse = (res: Response): Response => {
  return res.status(HttpStatus.NO_CONTENT).send();
};
