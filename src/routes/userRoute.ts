import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  changePassword,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import { revokeSessionByUser } from "../controllers/securityController.js";

const userRouter = Router();

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: get User profile
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
 * /api/v1/user/update:
 *   put:
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
 * /api/v1/user/changepassword:
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
 *         description: Password changed successfully
 */
userRouter.post("/changepassword", authMiddleware, changePassword);

/**
 * @swagger
 * /api/v1/user/revoke-sessions:
 *   delete:
 *     summary: Revoke all other active sessions for the current user
 *     description: Logs the user out of all devices except for the one making the request.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All other sessions have been successfully revoked.
 *       401:
 *         description: Unauthorized if the user is not authenticated.
 */
userRouter.delete("/revoke-sessions", authMiddleware, revokeSessionByUser);

export default userRouter;
