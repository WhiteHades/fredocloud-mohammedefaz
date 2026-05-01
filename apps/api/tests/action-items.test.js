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
      email: "tasks@notfredohub.test",
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

  it("creates an action item assigned to another workspace member", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "assign-admin@notfredohub.test",
      password: "password123",
      displayName: "Assignment Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Assignments",
      description: "Assignment workspace.",
      accentColor: "#2d6a4f",
    });

    const invitationResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "assign-member@notfredohub.test",
        role: "MEMBER",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "assign-member@notfredohub.test",
      password: "password123",
      displayName: "Assignment Member",
    });

    await memberAgent.post(`/api/workspaces/invitations/${invitationResponse.body.invitation.id}/accept`);

    const membersResponse = await adminAgent.get(`/api/workspaces/${workspaceResponse.body.workspace.id}/members`);
    const memberMembership = membersResponse.body.memberships.find(
      (membership) => membership.user.email === "assign-member@notfredohub.test",
    );

    const createResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/action-items`)
      .send({
        title: "Assign the board",
        status: "TODO",
        priority: "HIGH",
        assigneeMembershipId: memberMembership.id,
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.actionItem.assigneeMembershipId).toBe(memberMembership.id);
  });
});
