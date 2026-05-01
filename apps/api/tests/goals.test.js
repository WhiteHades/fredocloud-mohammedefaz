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
      email: "goals@notfredohub.test",
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

  it("adds milestones and progress updates to a goal detail view", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      email: "detail-goals@notfredohub.test",
      password: "password123",
      displayName: "Goal Detail Owner",
    });

    const workspaceResponse = await agent.post("/api/workspaces").send({
      name: "Studio Detail",
      description: "Goal detail workspace.",
      accentColor: "#003b8e",
    });

    const goalResponse = await agent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/goals`)
      .send({
        title: "Ship the detail view",
        status: "NOT_STARTED",
      });

    const milestoneResponse = await agent
      .post(`/api/goals/${goalResponse.body.goal.id}/milestones`)
      .send({
        title: "Draft milestone",
        progressPercentage: 25,
      });

    expect(milestoneResponse.statusCode).toBe(201);
    expect(milestoneResponse.body.milestone.progressPercentage).toBe(25);

    const updateResponse = await agent
      .post(`/api/goals/${goalResponse.body.goal.id}/updates`)
      .send({
        content: "The first progress note is in the feed.",
      });

    expect(updateResponse.statusCode).toBe(201);
    expect(updateResponse.body.update.content).toBe("The first progress note is in the feed.");

    const detailResponse = await agent.get(`/api/goals/${goalResponse.body.goal.id}`);

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body.goal.milestones).toHaveLength(1);
    expect(detailResponse.body.goal.updates).toHaveLength(1);
  });

  it("creates a goal for another member in the same workspace", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "goal-admin@notfredohub.test",
      password: "password123",
      displayName: "Goal Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Owners",
      description: "Goal owner workspace.",
      accentColor: "#c8102e",
    });

    const invitationResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "goal-member@notfredohub.test",
        role: "MEMBER",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "goal-member@notfredohub.test",
      password: "password123",
      displayName: "Goal Member",
    });

    await memberAgent.post(`/api/workspaces/invitations/${invitationResponse.body.invitation.id}/accept`);

    const membersResponse = await adminAgent.get(`/api/workspaces/${workspaceResponse.body.workspace.id}/members`);
    const memberMembership = membersResponse.body.memberships.find(
      (membership) => membership.user.email === "goal-member@notfredohub.test",
    );

    const createResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/goals`)
      .send({
        title: "Hand off ownership",
        status: "IN_PROGRESS",
        ownerMembershipId: memberMembership.id,
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.goal.ownerMembershipId).toBe(memberMembership.id);
  });
});
