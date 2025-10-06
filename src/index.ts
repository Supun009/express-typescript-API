import app from './app.js';
import {env} from './constant/env.js';
import { connectDB } from './config/db.js';
import { logger } from '../logger.js';
const port = env.PORT ;


app.listen(port, ()=> {
    logger.info(`Server is running at http://localhost:${port}`);
    connectDB();
});

