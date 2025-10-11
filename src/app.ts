import express, { type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/globalErrorHandler.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import { setupSwagger } from "./../swagger.js";
import adminRouter from "./routes/adminRoute.js";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { requestLogger } from "./middlewares/requestLogger.js";
import { env } from "./constant/env.js";
import helthRouter from "./routes/healthChekroute.js";
import { logger } from "./utils/logger.js";
import indexRouter from "./routes/indexRoute.js";

const app = express();

app.use(
  pinoHttp({
    logger: logger,
    customLogLevel: (req, res, err) => {
      if (res?.statusCode >= 400 && res?.statusCode < 500) {
        return "warn";
      }
      if (res?.statusCode >= 500 || err) {
        return "error";
      }
      return "info";
    },
  })
);



app.use(
  helmet({
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
  })
);

if (env.NODE_ENV === "development") {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP in dev
      crossOriginEmbedderPolicy: false,
    })
  );
}

setupSwagger(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(requestLogger);

app.use("/api", indexRouter);

app.use(errorHandler);

export default app;
