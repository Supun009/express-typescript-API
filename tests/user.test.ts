import request from "supertest";
import app from "../src/app.js";
import { getCookies } from "./cookieHelper.js";
import { testObject } from "./constant.js";

describe("User Tests", () => {
  let accessToken: string | undefined;
  let refreshToken: string | undefined;
  type ResetToken = { resetToken: string; id: string };
  let resetToken: ResetToken;
  // const testEmail = "test1@example.com";
  // const name = "Jone Doe";
  const updatedName = "UpdatedName";
  // const password = "newPassword";
  const newPassword = "newPassword1";
  const newConfirmPassword = "newPassword1";

  beforeAll(async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testObject.testEmail,
        password: testObject.newPassword,
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

  it("should get user profile", async () => {
    if (!accessToken) {
      throw new Error("Access token is not defined");
    }

    const response = await request(app)
      .get("/api/v1/user/profile")
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data.email).toBe(testObject.testEmail);
    expect(response.body.data.name).toBe(testObject.name);
  });

  it("should update user profile", async () => {
    if (!accessToken) {
      throw new Error("Access token is not defined");
    }

    const response = await request(app)
      .put("/api/v1/user/update")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        name: updatedName,
      })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data.name).toBe(updatedName);
  });

  it("should change user password", async () => {
    if (!accessToken) {
      throw new Error("Access token is not defined");
    }

    const response = await request(app)
      .post("/api/v1/user/changepassword")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        oldPassword: testObject.newPassword,
        newPassword: newPassword,
        confirmNewPassword: newConfirmPassword,
      })
      .expect(200);
  });
});
