const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("analytics routes", () => {
  beforeEach(async () => {
    await prisma.auditEvent.deleteMany();
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

  it("returns dashboard stats and goal completion chart data", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "analytics@notfredohub.test",
      password: "password123",
      displayName: "Analytics Owner",
    });

    const workspaceResponse = await agent.post("/api/workspaces").send({
      name: "Studio Analytics",
      description: "Analytics workspace.",
      accentColor: "#c8102e",
    });

    const goalResponse = await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/goals`)
      .send({
        title: "Ship analytics",
        status: "IN_PROGRESS",
      });

    await agent.post(`/api/goals/${goalResponse.body.goal.id}/milestones`).send({
      title: "First milestone",
      progressPercentage: 50,
    });

    await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/action-items`)
      .send({
        title: "Finish chart wiring",
        status: "DONE",
        dueDate: "2026-06-01T00:00:00.000Z",
      });

    await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/action-items`)
      .send({
        title: "Resolve overdue count",
        status: "TODO",
        dueDate: "2024-01-01T00:00:00.000Z",
      });

    const analyticsResponse = await agent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/analytics`,
    );

    expect(analyticsResponse.statusCode).toBe(200);
    expect(analyticsResponse.body.stats.totalGoals).toBe(1);
    expect(analyticsResponse.body.stats.itemsCompletedThisWeek).toBe(1);
    expect(analyticsResponse.body.stats.overdueCount).toBe(1);
    expect(analyticsResponse.body.goalCompletion).toHaveLength(1);
    expect(analyticsResponse.body.goalCompletion[0].progress).toBe(50);
  });
});
