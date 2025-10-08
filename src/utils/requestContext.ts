// src/utils/requestContext.ts
import { randomUUID } from 'crypto';
import type { Request } from 'express';

export interface RequestContext {
    requestId: string;
    userId?: string;
    sessionId?: string;
    ip: string | undefined;
    userAgent: string;
    path: string;
    method: string;
    timestamp: Date;
}

/**
 * Extract request context for logging
 */
export const getRequestContext = (req: Request): RequestContext => {
    // Get real IP address (considering proxies)
   const forwardedIp = req.headers['x-forwarded-for'] as string;
    const ip = forwardedIp ? (forwardedIp.split(',')[0] || '').trim() : req.ip;

    return {
        requestId: req.id ? String(req.id) : randomUUID(),
        userId: req.user?.userID ?? undefined,
        sessionId: req.user?.sessionId ?? undefined,
        ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        path: req.originalUrl || req.url,
        method: req.method,
        timestamp: new Date(),
    };
};

/**
 * Get device info from user agent
 */
export const parseUserAgent = (userAgent: string): {
    browser?: string;
    os?: string;
    device?: string;
} => {
    const ua = userAgent.toLowerCase();
    
    // Simple parsing (consider using 'ua-parser-js' for production)
    let browser = 'unknown';
    let os = 'unknown';
    let device = 'desktop';

    // Browser detection
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // OS detection
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone')) os = 'iOS';

    // Device type
    if (ua.includes('mobile')) device = 'mobile';
    else if (ua.includes('tablet')) device = 'tablet';

    return { browser, os, device };
};