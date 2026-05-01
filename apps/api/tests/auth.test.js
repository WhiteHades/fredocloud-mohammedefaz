const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("auth routes", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.membershipPermission.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a user and returns the current user from the cookie session", async () => {
    const agent = request.agent(app);

    const registerResponse = await agent.post("/api/auth/register").send({
      email: "founder@notfredohub.test",
      password: "password123",
      displayName: "Founding Member",
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body.user.email).toBe("founder@notfredohub.test");
    expect(registerResponse.body.user.displayName).toBe("Founding Member");
    expect(registerResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("notfredohub_access_token="),
        expect.stringContaining("notfredohub_refresh_token="),
      ]),
    );

    const currentUserResponse = await agent.get("/api/auth/me");

    expect(currentUserResponse.statusCode).toBe(200);
    expect(currentUserResponse.body.user.email).toBe("founder@notfredohub.test");
  });

  it("refreshes the cookie session and keeps the user signed in", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "refresh@notfredohub.test",
      password: "password123",
      displayName: "Refresh User",
    });

    const refreshResponse = await agent.post("/api/auth/refresh");

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("notfredohub_access_token="),
        expect.stringContaining("notfredohub_refresh_token="),
      ]),
    );

    const currentUserResponse = await agent.get("/api/auth/me");

    expect(currentUserResponse.statusCode).toBe(200);
    expect(currentUserResponse.body.user.email).toBe("refresh@notfredohub.test");
  });

  it("logs out the user and clears the current session", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "logout@notfredohub.test",
      password: "password123",
      displayName: "Logout User",
    });

    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.statusCode).toBe(204);

    const currentUserResponse = await agent.get("/api/auth/me");

    expect(currentUserResponse.statusCode).toBe(401);
  });

  it("updates the current user profile fields", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "profile@notfredohub.test",
      password: "password123",
      displayName: "Profile User",
    });

    const updateResponse = await agent.patch("/api/auth/me").send({
      displayName: "Swiss Profile",
      avatarPublicId: "avatars/profile-user",
      avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1/avatars/profile-user.jpg",
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.user.displayName).toBe("Swiss Profile");
    expect(updateResponse.body.user.avatarPublicId).toBe("avatars/profile-user");

    const currentUserResponse = await agent.get("/api/auth/me");

    expect(currentUserResponse.body.user.displayName).toBe("Swiss Profile");
    expect(currentUserResponse.body.user.avatarUrl).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1/avatars/profile-user.jpg",
    );
  });
});
