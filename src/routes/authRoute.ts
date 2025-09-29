import Router  from "express";
import { getResetToken, login, logout, refresUserToken, register, resetPassword } from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/register", register);

authRouter.post("/logout", logout);

authRouter.get("/refresh", refresUserToken);

authRouter.post("/reset-request", getResetToken);

authRouter.post("/reset-password", resetPassword);

export default authRouter;