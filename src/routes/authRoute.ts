import Router from "express";
import { getResetToken, login, logout, refresUserToken, register, resetPassword } from "../controllers/authController.js";

const authRouter = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.0LfQIWnxy4M8JnhybC1qnpHdJO1QRFp9MKnjuyZT1iFQpGF0aW9uZXhwPQkDMFpmw9Ij68UAx1jppr6FoAIbJnV2a3Mw
 */
authRouter.post("/login", login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: password
 *               confirmPassword:
 *                 type: string
 *                 example: password
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.post("/logout", logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   get:
 *     summary: Refresh user token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
authRouter.get("/refresh", refresUserToken);

/**
 * @swagger
 * /api/auth/reset-request:
 *   post:
 *     summary: Send password reset link to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent to user email
 */
authRouter.post("/reset-request", getResetToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.0LfQIWnxy4M8JnhybC1qnpHdJO1QRFp9MKnjuyZT1iFQpGF0aW9uZXhwPQkDMFpmw9Ij68UAx1jppr6FoAIbJnV2a3Mw
 *               id:
 *                 type: string
 *                 example: 1234567890
 *               password:
 *                 type: string
 *                 example: newPassword
 *               confirmPassword:
 *                 type: string
 *                 example: newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
authRouter.post("/reset-password", resetPassword);

export default authRouter;

