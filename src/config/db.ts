import { PrismaClient } from "@prisma/client";
import { logger } from "../../logger.js";

const prisma = new PrismaClient();

export default prisma;


export const connectDB = async (maxRetries = 3) => {
  let retries = 0;
  let connected = false;

  while (!connected && retries < maxRetries) {
    try {
      await prisma.$connect();
      logger.info("Database connected");
      connected = true;
    } catch (error) {
      logger.info(`Failed to connect to the database. Retrying... (${retries + 1}/${maxRetries})`);
      logger.error(error);
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
    }
  }

  if (!connected) {
    logger.error("Failed to connect to the database after multiple retries.");
    process.exit(1);
  }
};