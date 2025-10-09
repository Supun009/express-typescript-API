import Router from "express";
import { checkHealth } from "../controllers/healthchekController.js";

const helthRouter = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: pass
 *                 version:
 *                   type: string
 *                   example: 0.1.0
 *                 uptime:
 *                   type: string
 *                   example: 1d 2h 30m
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: pass
 *                         responseTime:
 *                           type: string
 *                           example: 0ms
 */
helthRouter.get("/", checkHealth);

export default helthRouter;
