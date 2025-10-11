import request from "supertest";

export const getCookies = (res: request.Response): string[] => {
  const raw = res.headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
};
