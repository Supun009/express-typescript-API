import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { deleteUserAdmin, deleteUsersAdmin, getActiveSessions, getLoginHistory, getSuspiciousActivity, getUserAdmin, getUsersAdmin, revokeUserSessionsAdmin, updateUserAdmin } from "../controllers/adminController.js";

const adminRouter = Router();

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 */
adminRouter.get("/users", authMiddleware, getUsersAdmin);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User by ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 */
adminRouter.get("/users/:id", authMiddleware, getUserAdmin);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
adminRouter.put("/users/:id", authMiddleware, updateUserAdmin);

/**
 * @swagger
 * /api/v1/admin/users/delete:
 *   delete:
 *     summary: Delete multiple users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users deleted
 */
adminRouter.delete("/users/delete", authMiddleware, deleteUsersAdmin);

/**
 * @swagger
 * /api/v1/admin/users/session:
 *   get:
 *     summary: Revoke all sessions for a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: All sessions revoked successfully by admin
 */
adminRouter.get("/active-session", authMiddleware, getActiveSessions);

/**
 * @swagger
 * /api/v1/admin/suspicious-activity:
 *   get:
 *     summary: Get suspicious activity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ipAddress
 *         schema:
 *           type: string
 *         required: true
 *         description: IP address to check for suspicious activity
 *     responses:
 *       200:
 *         description: Suspicious activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 failedAttempts:
 *                   type: integer
 */
adminRouter.get("/suspicious-activity", authMiddleware, getSuspiciousActivity);

/**
 * @swagger
 * /api/v1/admin/users/revoke-session:
 *   delete:
 *     summary: Revoke all sessions for a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: All sessions revoked successfully by admin
 */
adminRouter.delete("/revoke-sessions", authMiddleware, revokeUserSessionsAdmin);

/**
 * @swagger
 * /api/v1/admin/users/login-history:
 *   get:
 *     summary: Get login history for a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Login history retrieved successfully
 */
adminRouter.get("/users/login-history/:id", authMiddleware, getLoginHistory);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User deleted
 */
adminRouter.delete("/users/:id", authMiddleware, deleteUserAdmin);


export default adminRouter;
