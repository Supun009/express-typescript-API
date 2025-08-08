import z, { email } from "zod";
import asyncHandler from "../utils/asyncHandler.js";
import { loginUser, registerUser } from "../services/authService.js";
import { HttpStatus } from "../constant/http.js";

const logi = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
}).refine((data => data.password.length >= 6), {
    message: "Password must be at least 6 characters long",
    path: ["password"],
});

const reg = z.object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",  
    path: ["confirmPassword"],
});



export const login = asyncHandler(async(req, res)=> {
    const parsedData = logi.parse(req.body);

    if (parsedData) {
        const token = await loginUser(parsedData);
        res.cookie("token", token, {
            httpOnly: true, 
            secure: true,
            sameSite: "none",
        });
        return res.status(HttpStatus.OK).json({
        message: "Login successful"
    }); 
    }
    
});

export const register = asyncHandler(async(req, res)=> {
    const parsedData = reg.parse(req.body);

    if (parsedData) {
        await registerUser(parsedData);
        return res.status(HttpStatus.CREATED).json({
            message: "Registration successful",
        
        });
    }
}); 