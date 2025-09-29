import Router  from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { changePassword, getUser, updateUser } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/", authMiddleware, getUser);

userRouter.post("/update", authMiddleware, updateUser);

userRouter.post("/changepassword", authMiddleware, changePassword);

export default userRouter;