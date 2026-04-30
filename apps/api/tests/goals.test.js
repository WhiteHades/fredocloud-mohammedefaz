const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("goal routes", () => {
  beforeEach(async () => {
    await prisma.goalUpdate.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.goal.deleteMany();
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

  it("creates a goal and lists it back inside the workspace", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "goals@fredohub.test",
      password: "password123",
      displayName: "Goal Owner",
    });

    const workspaceResponse = await agent.post("/api/workspaces").send({
      name: "Studio Goals",
      description: "Goal planning workspace.",
      accentColor: "#c8102e",
    });

    const createResponse = await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/goals`)
      .send({
        title: "Launch the team hub",
        dueDate: "2026-06-30T00:00:00.000Z",
        status: "IN_PROGRESS",
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.goal.title).toBe("Launch the team hub");
    expect(createResponse.body.goal.status).toBe("IN_PROGRESS");

    const listResponse = await agent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/goals`,
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.goals).toHaveLength(1);
    expect(listResponse.body.goals[0].title).toBe("Launch the team hub");
  });
});
