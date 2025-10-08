import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { env } from './src/constant/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDevelopment = env.NODE_ENV === 'development';
const isTest = env.NODE_ENV === 'test';

const logDirectory = path.join(__dirname, 'logs');
if (!isDevelopment && !isTest) {
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