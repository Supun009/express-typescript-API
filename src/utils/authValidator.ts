import z, { email } from "zod";

export const logi = z.object({
    email: z.string().check(email("Invalid email format")),
    password: z.string().min(6, "Password must be at least 6 characters long"),
}).refine((data => data.password.length >= 6), {
    message: "Password must be at least 6 characters long",
    path: ["password"],
});

export const passwordSchema = z.object({
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",  
        path: ["confirmPassword"],
    });

export const reg = z.object({
    email: z.string().check(email("Invalid email format")),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",  
    path: ["confirmPassword"],
});