import { revokeAllSessionsUser } from "../services/securityService.js";
import { successResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getRequestContext, type RequestContext } from "../utils/requestContext.js";

export const revokeSessionByUser = asyncHandler(async(req, res) => {
    const userId = req.user.id;
    const sessionId = req.user.sessionId || "";

    const context = getRequestContext(req);

    await revokeAllSessionsUser(userId, sessionId, context);

    return successResponse(res, {}, "Session revoked successfully", 200);

});