import request from "supertest";
import app from "../src/app.js";
import { getCookies } from "./cookieHelper.js";
import { testObject } from "./constant.js";

describe("Admin Tests", () => {
  let accessToken: string | undefined;
  let userIds: string[] = [];
  let testUserId: string | undefined;
  const updatedName = "Updated_Name";
  let nonAdminAccessToken: string | undefined;
  const nonExistentId = "clw1234567890123456789012"; // A valid but non-existent UUID

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

    // Create and log in as a regular user for authorization tests
    await request(app).post("/api/v1/auth/register").send({
      email: testObject.testUserEmail,
      name: "Test User",
      password: testObject.password,
      confirmPassword: testObject.confirmPassword,
    });

    const userLoginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testObject.testUserEmail,
        password: testObject.password,
      })
      .expect(200);

    const userCookies = getCookies(userLoginResponse);
    const userAccessTokenCookie = userCookies.find((cookie: string) =>
      cookie.startsWith("accessToken="),
    );
    const userAccessTokenParts =
      userAccessTokenCookie?.split(";")[0]?.split("=") || [];
    if (userAccessTokenParts.length !== 2) {
      throw new Error("User login response did not include accessToken cookie");
    } else {
      nonAdminAccessToken = userAccessTokenParts[1];
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
    testUserId = userIds[0]; // Use a specific user for single-user tests
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

  it("should return 404 for a non-existent user ID", async () => {
    await request(app)
      .get(`/api/v1/admin/users/${nonExistentId}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(404);
  });

  it("should prevent non-admin from getting a user", async () => {
    await request(app)
      .get(`/api/v1/admin/users/${userIds[0]}`)
      .set("Cookie", [`accessToken=${nonAdminAccessToken}`])
      .expect(401);
  });

  it("should prevent unauthenticated access to get user", async () => {
    await request(app).get(`/api/v1/admin/users/${userIds[0]}`).expect(401);
  });

  it("should update user", async () => {
    expect(testUserId).toBeDefined();
    const response = await request(app)
      .put(`/api/v1/admin/users/${testUserId}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        name: updatedName,
      })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data.name).toBe(updatedName);
  });

  it("should return 400 when updating user with invalid data", async () => {
    expect(testUserId).toBeDefined();
    await request(app)
      .put(`/api/v1/admin/users/${testUserId}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        name: "", // Invalid name
      })
      .expect(400);
  });

  it("should get active sessions by user ids", async () => {
    // GET with body is unconventional. Using query params is better.
    // But to test the existing implementation:
    const response = await request(app)
      .get("/api/v1/admin/active-session")
      .send({
        // Assuming the admin user (from login) and the test user have active sessions
        userIds: userIds,
      })
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  it("should get login history for a user", async () => {
    expect(userIds.length).toBeGreaterThan(0);
    const response = await request(app)
      .get(`/api/v1/admin/users/login-history/${userIds[0]}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should get suspicious-activity by ip", async () => {
    // This test assumes a failed login from '::1' happened.
    // A more robust test would trigger a failed login first.
    const response = await request(app)
      .get("/api/v1/admin/suspicious-activity")
      .send({ ip: "::1" })
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it("should revoke all sessions for a user", async () => {
    const response = await request(app)
      .delete("/api/v1/admin/revoke-sessions")
      .send({ userIds: [userIds[0], userIds[1]] })
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(accessToken).toBeDefined();
    expect(response.body.message).toBe(
      "All sessions revoked successfully by admin",
    );
  });

  it("should delete a user", async () => {
    expect(testUserId).toBeDefined();
    const response = await request(app)
      .delete(`/api/v1/admin/users/${testUserId}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("User deleted successfully");

    // Verify user is soft-deleted
    const getResponse = await request(app)
      .get(`/api/v1/admin/users/${testUserId}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(getResponse.body.data.isDeleted).toBe(true);
  });

  it("should delete users", async () => {
    // Use a different user ID that hasn't been deleted yet.
    const userToDelete = userIds.find((id) => id !== testUserId);
    expect(userToDelete).toBeDefined();

    const response = await request(app)
      .delete("/api/v1/admin/users/delete")
      .send({ userIds: [userToDelete] })
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Users deleted successfully");
  });

  it("should return 404 when trying to delete non-existent users", async () => {
    await request(app)
      .delete("/api/v1/admin/users/delete")
      .send({ userIds: [nonExistentId] })
      .set("Cookie", [`accessToken=${accessToken}`])
      .expect(404);
  });
});
