import request from "supertest";
import app from "../src/app.js";
import { getCookies } from "./cookieHelper.js";



describe("Authentication Tests", () => {
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    type ResetToken = { resetToken: string, id: string };
    let resetToken: ResetToken;
    const testEmail = "test1@example.com";  
    const name = "Jone Doe";
    const password = "password";
    const confirmPassword = "password";
    const newPassword = "newPassword";
    const newConfirmPassword = "newPassword";

    beforeAll(async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: testEmail,
                name: name,
                password: password,
                confirmPassword: confirmPassword,
            })
            .expect(201);
    });

    it("should login a user", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: password,
            })
            .expect(200);

        const cookies = getCookies(response);
        expect(cookies).toBeDefined();    

        const accessTokenCookie = cookies.find((cookie: string) => cookie.startsWith("accessToken="));
        const refreshTokenCookie = cookies.find((cookie: string) => cookie.startsWith("refreshToken="));

        expect(accessTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toBeDefined();

        const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];
        const refreshTokenParts = refreshTokenCookie?.split(";")[0]?.split("=") || [];

        if (accessTokenParts.length !== 2 || refreshTokenParts.length !== 2) {
            throw new Error("Login response did not include cookies");
        } else {
            accessToken  = accessTokenParts[1];
            refreshToken  = refreshTokenParts[1];
        }

    });

    it("should refresh user token", async () => {
        const response = await request(app)
            .get("/api/auth/refresh")
            .set("Cookie", [`refreshToken=${refreshToken}`])
            .expect(200);
        
        const cookies = getCookies(response);
        expect(cookies).toBeDefined(); 

        const accessTokenCookie = cookies.find((cookie: string) => cookie.startsWith("accessToken="));
        expect(accessTokenCookie).toBeDefined();

        const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];

        if (accessTokenParts.length !== 2) {
            throw new Error("Refresh response did not include accessToken cookie");
        } else {
            accessToken  = accessTokenParts[1];
        }
    });

     it("should logout a user", async () => {
        const response = await request(app)
            .post("/api/auth/logout")
            .set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .expect(200);

        expect(response.body.message).toBe("Logged out");
    });

    it("should login a user", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: password,
            })
            .expect(200);

        const cookies = getCookies(response);
        expect(cookies).toBeDefined();    

        const accessTokenCookie = cookies.find((cookie: string) => cookie.startsWith("accessToken="));
        const refreshTokenCookie = cookies.find((cookie: string) => cookie.startsWith("refreshToken="));

        expect(accessTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toBeDefined();

        const accessTokenParts = accessTokenCookie?.split(";")[0]?.split("=") || [];
        const refreshTokenParts = refreshTokenCookie?.split(";")[0]?.split("=") || [];

        if (accessTokenParts.length !== 2 || refreshTokenParts.length !== 2) {
            throw new Error("Login response did not include cookies");
        } else {
            accessToken  = accessTokenParts[1];
            refreshToken  = refreshTokenParts[1];
        }

    });

    it("should get reset password token", async () => {
        const response = await request(app)
            .post("/api/auth/reset-request")
            .send({
                email: testEmail,
            })
            .expect(200);

        expect(response.body.message).toBe("Password reset link sent to your email");
        expect(response.body.token).toBeDefined();
        resetToken = response.body.token;

    });

    it("should reset password", async () => {
        const response = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: resetToken.resetToken,
                id: resetToken.id,
                password: newPassword,
                confirmPassword: newConfirmPassword,
            }).expect(200);

        expect(response.body.message).toBe("Password has been reset successfully");

        const setCookieHeaders = response.headers["set-cookie"];
        expect(setCookieHeaders).toEqual(
            expect.arrayContaining([
                expect.stringContaining("accessToken=;"), // cleared
                expect.stringContaining("refreshToken=;") // cleared
            ])
        );

    });

    
});