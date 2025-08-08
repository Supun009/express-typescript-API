import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserDocument } from '../models/userModel.js';
import type { SessionDocument } from '../models/sesionModel.js';
import Roles from '../constant/roles.js';
import { env } from '../constant/env.js';

export type accessTokenPayload = {
    userID: UserDocument['_id'];
    role: UserDocument['role'];
}

export type refreshTokenPayload = {
    sessionId: SessionDocument['_id'];
    userId: UserDocument['_id'];
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