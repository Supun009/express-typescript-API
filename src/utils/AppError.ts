import type { HttpStatus } from "../constant/http.js";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatus,
    public message: string,
  ) {
    super(message);
  }
}

export default AppError;
