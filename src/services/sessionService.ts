import prisma from "../config/db.js";

/**
 * Finds a session by its ID.
 * @param sessionId The ID of the session to find.
 * @returns The session object or null if not found.
 */
export const findSessionById = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  return session;
};
