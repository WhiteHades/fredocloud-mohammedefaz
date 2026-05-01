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
      email: "workspaces@notfredohub.test",
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
      email: "admin@notfredohub.test",
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
        email: "member@notfredohub.test",
        role: "MEMBER",
      });

    expect(invitationResponse.statusCode).toBe(201);
    expect(invitationResponse.body.invitation.email).toBe("member@notfredohub.test");

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "member@notfredohub.test",
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

  it("lists pending invitations for the signed-in user", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "listing-admin@notfredohub.test",
      password: "password123",
      displayName: "Listing Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Gamma",
      description: "Pending invitation workspace.",
      accentColor: "#2d6a4f",
    });

    await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "pending@notfredohub.test",
        role: "MEMBER",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "pending@notfredohub.test",
      password: "password123",
      displayName: "Pending Member",
    });

    const pendingResponse = await memberAgent.get("/api/workspaces/invitations");

    expect(pendingResponse.statusCode).toBe(200);
    expect(pendingResponse.body.invitations).toHaveLength(1);
    expect(pendingResponse.body.invitations[0].workspace.name).toBe("Studio Gamma");
  });

  it("rejects invitation creation from a non-admin member", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "guard-admin@notfredohub.test",
      password: "password123",
      displayName: "Guard Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Delta",
      description: "Guard workspace.",
      accentColor: "#f0b429",
    });

    await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "guard-member@notfredohub.test",
        role: "MEMBER",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "guard-member@notfredohub.test",
      password: "password123",
      displayName: "Guard Member",
    });

    const pendingResponse = await memberAgent.get("/api/workspaces/invitations");
    const invitationId = pendingResponse.body.invitations[0].id;

    await memberAgent.post(`/api/workspaces/invitations/${invitationId}/accept`);

    const forbiddenResponse = await memberAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "blocked@notfredohub.test",
        role: "MEMBER",
      });

    expect(forbiddenResponse.statusCode).toBe(403);
  });
});
