import type { accessTokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    export interface Request {
      user?: accessTokenPayload;
    }
  }
}
