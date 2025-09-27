import jwt, { type SignOptions } from 'jsonwebtoken';
import Roles from '../constant/roles.js';
import { env } from '../constant/env.js';
import AppError from './appError.js';

export type accessTokenPayload = {
    userID: String;
    role: String;
}

export type refreshTokenPayload = {
    sessionId: String;
    userId: String;
}

type SignOptionAndSecret = SignOptions &{
    secret: string;
}

const defaults: SignOptions = {
  audience: [Roles.USER],
};

const accessTokenSignOptions: SignOptionAndSecret = {
    expiresIn: '15m',
    secret: env.ACCESS_JWT_SECRET,
};

export const refreshTokenSignOptions: SignOptionAndSecret = {
    expiresIn: '7d',
    secret: env.REFRESH_JWT_SECRET,
};



export const createToken =  (payload : accessTokenPayload | refreshTokenPayload, options?: SignOptionAndSecret) => {

    const { secret, ...signOptions } = options || accessTokenSignOptions;
    return  jwt.sign(payload, secret, {
        ...defaults,
        ...signOptions
    });
    
}

export const verifyToken = (accessToken: string, options?: SignOptionAndSecret) => {
    const { secret } = options || accessTokenSignOptions;
    try {
        
    const decoded =  jwt.verify(accessToken, secret);

    if (decoded === null || typeof decoded === 'string') {
        throw new AppError(401, "Invalid token");

    }  
    return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError(401, "Token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError(401, "Invalid token");
        }
    }
}