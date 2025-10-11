import prisma from "../config/db.js";
import { HttpStatus } from "../constant/http.js";
import { successResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// src/controllers/healthchekController.ts
export const checkHealth = asyncHandler(async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    memory: checkMemory(),
    uptime: process.uptime(),
  };

  const overallStatus = (Object.values(checks) as { status?: string }[]).every(
    (c) => c.status === "pass",
  )
    ? "pass"
    : "fail";

  return successResponse(
    res,
    checks,
    "Health check",
    overallStatus === "pass" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
  );
});

const checkDatabase = async () => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { status: "pass", responseTime: `${Date.now() - start}ms` };
  } catch (error) {
    return { status: "fail", error: error };
  }
};

const checkMemory = () => {
  const used = process.memoryUsage();
  return {
    status: "pass",
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
  };
};
