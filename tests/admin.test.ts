import request from "supertest";
import app from "../src/app.js";
import { getCookies } from "./cookieHelper.js";

describe("Admin Tests", () => {
  let accessToken: string | undefined;
  let userIds: string[] | [];
  const updatedName = "Updated_Name";

  beforeAll(async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@example.com",
        password: "111111",
      })
      .expect(200);

    const cookies = getCookies(response);
    expect(cookies).toBeDefined();

    const accessTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("accessToken="),
    );

    expect(accessTokenCookie).toBeDefined();

    const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];

    if (accessTokenParts.length !== 2) {
      throw new Error("Login response did not include accessToken cookie");
    } else {
      accessToken = accessTokenParts[1];
    }
  });

  it("should get all not deleted users and populate userIds", async () => {
    const response = await request(app)
      .get("/api/v1/admin/users")
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0); // Ensure there's at least one user

    // Extract user IDs for subsequent tests
    userIds = response.body.data.map((user: { id: string }) => user.id);
    expect(userIds.length).toBeGreaterThan(0);
  });

  it("should get user by id", async () => {
    const response = await request(app)
      .get(`/api/v1/admin/users/${userIds[0]}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data.id).toBe(userIds[0]);
  });

  it("should update user", async () => {
    const response = await request(app)
      .put(`/api/v1/admin/users/${userIds[0]}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        name: updatedName,
      })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data.name).toBe(updatedName);
  });

  it("should delete users", async () => {
    const response = await request(app)
      .delete("/api/v1/admin/users/delete")
      .send({ userIds: [userIds[0], userIds[1]] })
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Users deleted successfully");
  });

  it("should delete a user", async () => {
    const response = await request(app)
      .delete(`/api/v1/admin/users/${userIds[0]}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("User deleted successfully");
  });
});
