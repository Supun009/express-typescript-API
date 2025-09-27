import Router  from "express";
import { login, refresUserToken, register } from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/register", register);

authRouter.get("/refresh", refresUserToken);

export default authRouter;