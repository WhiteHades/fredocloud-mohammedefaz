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
      email: "founder@fredohub.test",
      password: "password123",
      displayName: "Founding Member",
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body.user.email).toBe("founder@fredohub.test");
    expect(registerResponse.body.user.displayName).toBe("Founding Member");
    expect(registerResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("fredohub_access_token="),
        expect.stringContaining("fredohub_refresh_token="),
      ]),
    );

    const currentUserResponse = await agent.get("/api/auth/me");

    expect(currentUserResponse.statusCode).toBe(200);
    expect(currentUserResponse.body.user.email).toBe("founder@fredohub.test");
  });
});
