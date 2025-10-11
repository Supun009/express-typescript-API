import app from "./app.js";
import { env } from "./constant/env.js";
import prisma, { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
const port = env.PORT;

const server = app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
  connectDB();
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed");
    await prisma.$disconnect();
    logger.info("Database connection closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
