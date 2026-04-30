const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("action item routes", () => {
  beforeEach(async () => {
    await prisma.actionItem.deleteMany();
    await prisma.announcementReaction.deleteMany();
    await prisma.announcementComment.deleteMany();
    await prisma.announcement.deleteMany();
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

  it("creates an action item linked to a goal and updates its status", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "tasks@fredohub.test",
      password: "password123",
      displayName: "Task Owner",
    });

    const workspaceResponse = await agent.post("/api/workspaces").send({
      name: "Studio Tasks",
      description: "Action item workspace.",
      accentColor: "#2d6a4f",
    });

    const goalResponse = await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/goals`)
      .send({
        title: "Ship the action board",
        status: "IN_PROGRESS",
      });

    const createResponse = await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/action-items`)
      .send({
        title: "Wire list and board views",
        status: "TODO",
        priority: "HIGH",
        goalId: goalResponse.body.goal.id,
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.actionItem.goalId).toBe(goalResponse.body.goal.id);

    const updateResponse = await agent
      .patch(`/api/action-items/${createResponse.body.actionItem.id}`)
      .send({ status: "DONE" });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.actionItem.status).toBe("DONE");

    const listResponse = await agent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/action-items`,
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.actionItems).toHaveLength(1);
    expect(listResponse.body.actionItems[0].status).toBe("DONE");
  });
});
