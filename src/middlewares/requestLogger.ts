// src/middlewares/requestLogger.ts
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../../logger.js';

/**
 * Middleware to add request ID and enhanced logging
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    // Generate unique request ID
    req.id = randomUUID();

    // Get real IP
    const forwardedIp = req.headers['x-forwarded-for'] as string;
    const ip = forwardedIp ? (forwardedIp.split(',')[0] || '').trim() : req.ip;


    // Start time for response time calculation
    const startTime = Date.now();

    // Log request
    logger.info({
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.userID,
    }, 'Incoming request');

    // Log response
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