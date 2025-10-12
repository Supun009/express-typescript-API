import express, { type Response } from "express";
import { setupSwagger } from "./../swagger.js";
import indexRouter from "./routes/indexRoute.js";
import { apiMiddlewares } from "./middlewares/apiMiddleware.js";

const app = express();

app.use(apiMiddlewares);

setupSwagger(app);

app.disable("x-powered-by");
app.use("/api", indexRouter);

export default app;
