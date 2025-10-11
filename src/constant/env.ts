import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().positive()),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.url().min(1, "DATABASE_URL is required"),

  ACCESS_JWT_SECRET: z
    .string()
    .min(32, "ACCESS_JWT_SECRET must be at least 32 characters"),
  REFRESH_JWT_SECRET: z
    .string()
    .min(32, "REFRESH_JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRATION: z.string().default("15m"),

  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

function validateEnv() {
  try {
    console.log("Validating environment variables...");
    const parsed = envSchema.parse(process.env);
    console.log("Environment variables validated successfully");
    // logger.info('✅ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      // logger.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
        // logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    // logger.error('Please check your .env file and ensure all required variables are set correctly.');
    process.exit(1);
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
