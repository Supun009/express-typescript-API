import express, { type Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./../swagger_output.json" with { type: "json" };
import indexRouter from "./routes/indexRoute.js";
import { apiMiddlewares } from "./middlewares/apiMiddleware.js";

const app = express();

app.use(apiMiddlewares);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

app.disable("x-powered-by");
app.use("/api", indexRouter);

export default app;
