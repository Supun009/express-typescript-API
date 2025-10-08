// 
// src/constant/env.ts
import * as dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../../logger.js';

dotenv.config();

// Define environment schema with Zod
const envSchema = z.object({
    // Server
    PORT: z.string().transform(Number).pipe(z.number().positive()),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    
    // Database
    DATABASE_URL: z.url().min(1, "DATABASE_URL is required"),
    
    // JWT
    ACCESS_JWT_SECRET: z.string().min(32, "ACCESS_JWT_SECRET must be at least 32 characters"),
    REFRESH_JWT_SECRET: z.string().min(32, "REFRESH_JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRATION: z.string().default('15m'),
    
    // Client
    CLIENT_URL: z.string().url().default('http://localhost:3000'),
    
    // Optional: Email (for future implementation)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
    try {
        const parsed = envSchema.parse(process.env);
        logger.info('✅ Environment variables validated successfully');
        return parsed;
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.error('❌ Environment validation failed:');
            error.issues.forEach((err) => {
                logger.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        logger.error('Please check your .env file and ensure all required variables are set correctly.');
        process.exit(1);
    }
}

export const env = validateEnv();

// Type-safe environment object
export type Env = z.infer<typeof envSchema>;