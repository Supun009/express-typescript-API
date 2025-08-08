import mongoose, { mongo } from "mongoose";
import { env } from "../constant/env.js";

export async function connectToDatabase() {
    try {
     
    const uri = env.MONGO_URI;
        
    await mongoose.connect(uri);

    console.log('Connected to the database successfully');
    } catch (error) {
            console.error('Error connecting to the database:', error);
            process.exit(1); 
    }
    
}