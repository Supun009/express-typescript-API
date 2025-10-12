import pino from "pino";
import fs from "fs";
import path from "path";
import { env } from "../constant/env.js";
import type { Request } from "express";

const isDevelopment = env.NODE_ENV === "development";
const isTest = env.NODE_ENV === "test";

// Use project root for logs, which is more standard and robust.
const logDirectory = path.join(process.cwd(), "logs");
if (!isDevelopment) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

export const logger = pino({
  level: isDevelopment ? "debug" : "info",
  enabled: !isTest,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: false,
  },
});

export const logRequest = (req: Request) => {
  logger.info({
    type: "REQUEST",
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.userID,
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    type: "ERROR",
    message: error.message,
    stack: error.stack,
    ...context,
  });
};
