import assert from "node:assert";
import AppError from "./AppError.js";
import type { HttpStatus } from "../constant/http.js";

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatus,
  message: string,
) => asserts condition;

const appAssert: AppAssert = (condition, httpStatusCode, message) =>
  assert(condition, new AppError(httpStatusCode, message));

export default appAssert;
