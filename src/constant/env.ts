import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || 'your_jwt_secret',
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || 'your_refresh_jwt_secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
};

