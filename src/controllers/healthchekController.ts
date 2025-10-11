import { logger } from "../utils/logger.js";
import prisma from "../config/db.js";
import { HttpStatus } from "../constant/http.js";
import { createdResponse, successResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const checkHealth = asyncHandler(async (req, res) => {
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / (60 * 60 * 24))}d ${Math.floor(
      (uptime % (60 * 60 * 24)) / (60 * 60)
    )}h ${Math.floor(uptime % (60 * 60)) / 60}m`;

    const checks = {
      database: {
        status: "pass",
        responseTime: "0ms",
      },
    };

    let overallStatus = "pass";
    let httpStatus = HttpStatus.OK;

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbEnd = Date.now();
      checks.database.responseTime = `${dbEnd - dbStart}ms`;
    } catch (e) {
      checks.database.status = "fail";
      overallStatus = "fail";
      httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
      if (e instanceof Error) {
        logger.error(
          `Health check failed: database connection error', ${e.message}`
        );
      }
    }

    return successResponse(res, {}, "Health check successful", httpStatus, {
      status: overallStatus,
      version: "0.1.0",
      uptime: uptimeString,
      checks: checks,
    });

  });