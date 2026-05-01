const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("audit routes", () => {
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

  it("records workspace mutations and exports them as csv", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "audit@fredohub.test",
      password: "password123",
      displayName: "Audit Admin",
    });

    const workspaceResponse = await agent.post("/api/workspaces").send({
      name: "Studio Audit",
      description: "Audit workspace.",
      accentColor: "#c8102e",
    });

    await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/goals`)
      .send({ title: "Record a goal" });

    await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "Record an announcement",
        content: "The audit trail should include this.",
      });

    await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/action-items`)
      .send({
        title: "Record an action item",
      });

    const listResponse = await agent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/audit-events`,
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.auditEvents.length).toBeGreaterThanOrEqual(3);

    const exportResponse = await agent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/audit-events/export`,
    );

    expect(exportResponse.statusCode).toBe(200);
    expect(exportResponse.headers["content-type"]).toContain("text/csv");
    expect(exportResponse.text).toContain("action,targetType,targetId,summary,createdAt");
  });
});
