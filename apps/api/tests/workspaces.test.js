const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("workspace routes", () => {
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

  it("creates a workspace and returns it in the membership list", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "workspaces@fredohub.test",
      password: "password123",
      displayName: "Workspace Admin",
    });

    const createResponse = await agent.post("/api/workspaces").send({
      name: "Studio Alpha",
      description: "A Swiss grid for team planning.",
      accentColor: "#c8102e",
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.membership.role).toBe("ADMIN");
    expect(createResponse.body.workspace.name).toBe("Studio Alpha");

    const listResponse = await agent.get("/api/workspaces");

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.memberships).toHaveLength(1);
    expect(listResponse.body.memberships[0].workspace.name).toBe("Studio Alpha");
    expect(listResponse.body.memberships[0].role).toBe("ADMIN");
  });

  it("creates an invitation and lets the invited user accept it", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "admin@fredohub.test",
      password: "password123",
      displayName: "Admin User",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Beta",
      description: "Invitation flow workspace.",
      accentColor: "#003b8e",
    });

    const invitationResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "member@fredohub.test",
        role: "MEMBER",
      });

    expect(invitationResponse.statusCode).toBe(201);
    expect(invitationResponse.body.invitation.email).toBe("member@fredohub.test");

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "member@fredohub.test",
      password: "password123",
      displayName: "Member User",
    });

    const acceptResponse = await memberAgent.post(
      `/api/workspaces/invitations/${invitationResponse.body.invitation.id}/accept`,
    );

    expect(acceptResponse.statusCode).toBe(200);
    expect(acceptResponse.body.membership.role).toBe("MEMBER");

    const membershipListResponse = await memberAgent.get("/api/workspaces");

    expect(membershipListResponse.statusCode).toBe(200);
    expect(membershipListResponse.body.memberships).toHaveLength(1);
    expect(membershipListResponse.body.memberships[0].workspace.name).toBe("Studio Beta");
  });
});
