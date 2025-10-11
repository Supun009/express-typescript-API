import express from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js";
import adminRouter from "./adminRoute.js";
import helthRouter from "./healthChekroute.js";

const indexRouter = express.Router();

indexRouter.use("/v1/auth", authRouter);
indexRouter.use("/v1/health", helthRouter);
indexRouter.use("/v1/user", userRouter);
indexRouter.use("/v1/admin", adminRouter);

export default indexRouter;
