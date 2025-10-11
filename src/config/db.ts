import { PrismaClient } from "@prisma/client";
import { logger, logError } from "../utils/logger.js";

const prisma = new PrismaClient();

export default prisma;

export const connectDB = async (maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      logger.info("✅ Database connected successfully");
      return;
    } catch (error) {
      logger.warn(`Database connection attempt ${i + 1}/${maxRetries} failed`);
      if (i === maxRetries - 1) {
        //  logger.error(`Failed to connect to database ${error}`);
        logError(error as Error, { message: "Failed to connect to database" });
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
    }
  }
};
