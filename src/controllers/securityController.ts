import {
  revokeAllSessionsUser,
  revokeSessionByID,
  type RevokeSessionByIDArgs,
} from "../services/securityService.js";
import { successResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getRequestContext } from "../utils/requestContext.js";

export const revokeSessionByUser = asyncHandler(async (req, res) => {
  const userId = req.user.userID;
  const sessionId = req.user.sessionId || "";
  const context = getRequestContext(req);

  const args: RevokeSessionByIDArgs = { sessionId, userId, context };

  await revokeSessionByID(args);

  return successResponse(res, {}, "Session revoked successfully", 200);
});
