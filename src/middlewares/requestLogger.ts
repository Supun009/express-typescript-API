import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';


export const requestLogger = (req: Request, res: Response, next: NextFunction) => {

    req.id = randomUUID();

    const forwardedIp = req.headers['x-forwarded-for'] as string;
    const ip = forwardedIp ? (forwardedIp.split(',')[0] || '').trim() : req.ip;


    const startTime = Date.now();

    logger.info({
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.userID,
    }, 'Incoming request');

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        logger.info({
            requestId: req.id,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip,
            userId: req.user?.userID,
        }, 'Request completed');
    });

    next();
};