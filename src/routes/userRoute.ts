import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { changePassword, getUser, updateUser } from "../controllers/userController.js";

const userRouter = Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 name:
 *                   type: string
 *                   example: John Doe
 */
userRouter.get("/profile", authMiddleware, getUser);

/**
 * @swagger
 * /api/user/update:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: User profile updated
 */
userRouter.put("/update", authMiddleware, updateUser);

/**
 * @swagger
 * /api/user/changepassword:
 *   post:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldPassword
 *               newPassword:
 *                 type: string
 *                 example: newPassword
 *               confirmPassword:
 *                 type: string
 *                 example: newPassword
 *     responses:
 *       200:
 *         description: Password changed
 */
userRouter.post("/changepassword", authMiddleware, changePassword);

export default userRouter;

