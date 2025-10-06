import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import cors from 'cors';
import errorHandler from './middlewares/globleErrorHandler.js';
import authRouter from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';
import { setupSwagger } from './../swagger.js';
import adminRouter from './routes/adminRoute.js';
import helmet from 'helmet';

const app = express();

app.use(
  helmet({
    // Content Security Policy - prevents XSS attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    
    // DNS Prefetch Control - controls browser DNS prefetching
    dnsPrefetchControl: {
      allow: false,
    },
  
    
    // Frameguard - prevents clickjacking
    frameguard: {
      action: 'deny', // or 'sameorigin'
    },
    
    // Hide Powered-By header
    hidePoweredBy: true,
    
    // HSTS - force HTTPS
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    
    // IE No Open - sets X-Download-Options for IE8+
    ieNoOpen: true,
    
    // Don't Sniff Mimetype
    noSniff: true,
    
    // Origin Agent Cluster
    originAgentCluster: true,
    
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
    
    // Referrer Policy
    referrerPolicy: {
      policy: 'no-referrer',
    },
    
    // XSS Filter (legacy)
    xssFilter: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP in dev
      crossOriginEmbedderPolicy: false,
    })
  );
}

setupSwagger(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies to be sent with requests
  }));

  app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
 
  next();
});

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/admin', adminRouter);



app.use(errorHandler);  

export default app;