import express, { type Response } from "express";
import errorHandler from "./middlewares/globalErrorHandler.js";
import { setupSwagger } from "./../swagger.js";

// import { pinoHttp } from "pino-http";
// import { requestLogger } from "./middlewares/requestLogger.js";
// import { env } from "./constant/env.js";
// import { logger } from "./utils/logger.js";
import indexRouter from "./routes/indexRoute.js";
import { apiMiddlewares } from "./middlewares/apiMiddleware.js";

const app = express();

// app.use(
//   pinoHttp({
//     logger: logger,
//     customLogLevel: (req, res, err) => {
//       if (res?.statusCode >= 400 && res?.statusCode < 500) {
//         return "warn";
//       }
//       if (res?.statusCode >= 500 || err) {
//         return "error";
//       }
//       return "info";
//     },
//   })
// );

setupSwagger(app);

app.use(apiMiddlewares);

app.use("/api", indexRouter);

app.use(errorHandler);

export default app;
