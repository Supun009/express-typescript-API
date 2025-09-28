import Router  from "express";
import { login, logout, refresUserToken, register } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/register", register);

authRouter.post("/logout", logout);

authRouter.get("/refresh", refresUserToken);

export default authRouter;