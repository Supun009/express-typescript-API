import express from 'express';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './config/db.js';
import cors from 'cors';
import errorHandler from './middlewares/globleErrorHandler.js';
import authRouter from './routes/authRoute.js';
const app = express();
const port = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies to be sent with requests
  }));

  app.use('/api/auth', authRouter);



app.use(errorHandler);


app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
    connectToDatabase();
});