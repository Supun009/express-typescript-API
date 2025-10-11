// src/utils/requestContext.ts
import { randomUUID } from "crypto";
import { UAParser } from "ua-parser-js";
import type { Request } from "express";

export interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ip: string | undefined;
  userAgent: string;
  path: string;
  method: string;
  timestamp: Date;
}

export const getRequestContext = (req: Request): RequestContext => {
  // Get real IP address (considering proxies)
  const forwardedIp = req.headers["x-forwarded-for"] as string;
  const ip = forwardedIp ? (forwardedIp.split(",")[0] || "").trim() : req.ip;

  return {
    requestId: req.id ? String(req.id) : randomUUID(),
    userId: req.user?.userID ?? undefined,
    sessionId: req.user?.sessionId ?? undefined,
    ip,
    userAgent: req.headers["user-agent"] || "unknown",
    path: req.originalUrl || req.url,
    method: req.method,
    timestamp: new Date(),
  };
};

export const parseUserAgent = (
  userAgent: string,
): {
  browser?: string;
  os?: string;
  device?: string;
} => {
  if (!userAgent) {
    return { browser: "unknown", os: "unknown", device: "unknown" };
  }
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || "unknown",
    os: result.os.name || "unknown",
    device: result.device.type || "desktop",
  };
};
