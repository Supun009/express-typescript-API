import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bhmaox2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
export const env = {
    MONGO_URI: MONGO_URI,
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || 'your_jwt_secret',
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || 'your_refresh_jwt_secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
};