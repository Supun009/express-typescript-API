import helmet from "helmet";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { requestLogger } from "./requestLogger.js";
import { limiter } from "./rateLimitter.js";
import { env } from "../constant/env.js";

const helmetConfig = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // DNS Prefetch Control - controls browser DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // Frameguard - prevents clickjacking
  frameguard: {
    action: "deny", // or 'sameorigin'
  },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HSTS - force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open - sets X-Download-Options for IE8+
  ieNoOpen: true,

  // Don't Sniff Mimetype
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: "none",
  },

  // Referrer Policy
  referrerPolicy: {
    policy: "no-referrer",
  },

  // XSS Filter (legacy)
  xssFilter: true,
});

export const apiMiddlewares = [
  helmetConfig,
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true, limit: "10mb" }),
  cookieParser(),
  requestLogger,
  limiter,
];
