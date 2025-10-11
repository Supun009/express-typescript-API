import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { env } from '../constant/env.js';
import type { Request } from 'express';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDevelopment = env.NODE_ENV === 'development';
const isTest = env.NODE_ENV === 'test';

const logDirectory = path.join(__dirname, 'logs');
if (!isDevelopment) {
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }
}

export const logger = pino({
    level: isDevelopment ? 'debug' : 'info',
    enabled: !isTest,
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    } : {
        target: 'pino/file',
        options: {
            destination: path.join(logDirectory, 'app.log')
        }},
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        pid: false,
    }
});

export const logRequest = (req: Request) => {
  logger.info({
    type: 'REQUEST',
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.userID,
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    type: 'ERROR',
    message: error.message,
    stack: error.stack,
    ...context,
  });
};