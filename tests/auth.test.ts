import request from "supertest";
import app from "../src/app.js";
import { getCookies } from "./cookieHelper.js";
import { testObject } from "./constant.js";

describe("Authentication Tests", () => {
  let accessToken: string | undefined;
  let refreshToken: string | undefined;
  type ResetToken = { resetToken: string; id: string };
  let resetToken: ResetToken;
  // const testEmail = "supun@example.com";
  // const name = "Jone Doe";
  // const password = "password";
  // const confirmPassword = "password";
  // const newPassword = "newPassword";

  beforeAll(async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: testObject.testEmail,
        name: testObject.name,
        password: testObject.password,
        confirmPassword: testObject.confirmPassword,
      })
      .expect(201);
  });

  it("should not register with an existing email", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: testObject.testEmail,
        name: testObject.name,
        password: testObject.password,
        confirmPassword: testObject.confirmPassword,
      })
      .expect(409);
  });

  it("should not register with mismatched passwords", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "newuser@example.com",
        name: testObject.name,
        password: testObject.password,
        confirmPassword: "differentpassword",
      })
      .expect(400);
  });

  it("should login a user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testObject.testEmail,
        password: testObject.password,
      })
      .expect(200);

    const cookies = getCookies(response);
    expect(cookies).toBeDefined();

    const accessTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("accessToken="),
    );
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("refreshToken="),
    );

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];
    const refreshTokenParts =
      refreshTokenCookie?.split(";")[0]?.split("=") || [];

    if (accessTokenParts.length !== 2 || refreshTokenParts.length !== 2) {
      throw new Error("Login response did not include cookies");
    } else {
      accessToken = accessTokenParts[1];
      refreshToken = refreshTokenParts[1];
    }
  });

  it("should not login with non-existent email", async () => {
    await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: testObject.password,
      })
      .expect(404);
  });

  it("should not login with incorrect password", async () => {
    await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testObject.testEmail,
        password: "incorrectpassword",
      })
      .expect(400);
  });

  it("should refresh user token", async () => {
    const response = await request(app)
      .get("/api/v1/auth/refresh")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(200);

    const cookies = getCookies(response);
    expect(cookies).toBeDefined();

    const accessTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("accessToken="),
    );
    expect(accessTokenCookie).toBeDefined();

    const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];

    if (accessTokenParts.length !== 2) {
      throw new Error("Refresh response did not include accessToken cookie");
    } else {
      accessToken = accessTokenParts[1];
    }
  });

  it("should not refresh token with invalid token", async () => {
    await request(app)
      .get("/api/v1/auth/refresh")
      .set("Cookie", [`refreshToken=invalidtoken`])
      .expect(401);
  });

  it("should logout a user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .expect(200);

    expect(response.body.message).toBe("Logout successful");
  });

  it("should not logout if not logged in", async () => {
    await request(app).post("/api/v1/auth/logout").expect(401);
  });

  it("should login a user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testObject.testEmail,
        password: testObject.password,
      })
      .expect(200);

    const cookies = getCookies(response);
    expect(cookies).toBeDefined();

    const accessTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("accessToken="),
    );
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("refreshToken="),
    );

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];
    const refreshTokenParts =
      refreshTokenCookie?.split(";")[0]?.split("=") || [];

    if (accessTokenParts.length !== 2 || refreshTokenParts.length !== 2) {
      throw new Error("Login response did not include cookies");
    } else {
      accessToken = accessTokenParts[1];
      refreshToken = refreshTokenParts[1];
    }
  });

  it("should get reset password token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: testObject.testEmail,
      })
      .expect(201);

    expect(response.body.message).toBe("Reset token created successfully");
    expect(response.body.data.resetToken).toBeDefined();
    console.log(response.body.data);
    resetToken = response.body.data;
  });

  it("should not get reset password token for non-existent email", async () => {
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: "nonexistent@example.com",
      })
      .expect(404);
  });

  it("should reset password", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: resetToken.resetToken,
        id: resetToken.id,
        password: testObject.newPassword,
        confirmPassword: testObject.newPassword,
      })
      .expect(200);

    expect(response.body.message).toBe("Password has been reset successfully");

    const setCookieHeaders = response.headers["set-cookie"];
    expect(setCookieHeaders).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken=;"), // cleared
        expect.stringContaining("refreshToken=;"), // cleared
      ]),
    );
  });

  it("should not reset password with invalid token", async () => {
    await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: "invalidtoken",
        id: resetToken.id,
        password: testObject.newPassword,
        confirmPassword: testObject.newPassword,
      })
      .expect(401);
  });

  it("should not reset password with mismatched passwords", async () => {
    await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: resetToken.resetToken,
        id: resetToken.id,
        password: testObject.newPassword,
        confirmPassword: "differentpassword",
      })
      .expect(400);
  });
});
