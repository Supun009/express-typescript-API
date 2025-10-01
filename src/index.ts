import app from './app.js';
import {env} from './constant/env.js';
import { connectDB } from './config/db.js';
const port = env.PORT ;


app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
    connectDB();
});

