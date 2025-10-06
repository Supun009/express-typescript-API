import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 1. Reconstruct __filename (absolute path to the current file)
const __filename = fileURLToPath(import.meta.url);

// 2. Reconstruct __dirname (absolute path to the current directory)
const __dirname = dirname(__filename);

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

const logDirectory = path.join(__dirname, 'logs'); // Adjust path as needed
if (!isDevelopment && !isTest) {
    console.log('Creating log directory:', logDirectory);
    // Only create the directory if we are in a production/staging environment
    // where file logging is active.
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
    targets: [
        { target: 'pino/file', options: { destination: path.join(logDirectory, 'app.log') } },
        ],
       options: {
            destination: path.join(logDirectory, 'app.log'),
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        pid: false,}
});