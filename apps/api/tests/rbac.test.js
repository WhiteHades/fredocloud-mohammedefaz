const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("rbac routes", () => {
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

  it("lets an admin grant announcement publishing to a member", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "rbac-admin@fredohub.test",
      password: "password123",
      displayName: "RBAC Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio RBAC",
      description: "Permission matrix workspace.",
      accentColor: "#c8102e",
    });

    const invitationResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "rbac-member@fredohub.test",
        role: "MEMBER",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "rbac-member@fredohub.test",
      password: "password123",
      displayName: "RBAC Member",
    });

    await memberAgent.post(`/api/workspaces/invitations/${invitationResponse.body.invitation.id}/accept`);

    const forbiddenPublishResponse = await memberAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "Blocked Announcement",
        content: "This should fail before permissions change.",
      });

    expect(forbiddenPublishResponse.statusCode).toBe(403);

    const membersResponse = await adminAgent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/members`,
    );
    const memberRecord = membersResponse.body.memberships.find(
      (membership) => membership.user.email === "rbac-member@fredohub.test",
    );

    const permissionResponse = await adminAgent
      .patch(
        `/api/workspaces/${workspaceResponse.body.workspace.id}/members/${memberRecord.id}/permissions`,
      )
      .send({
        permission: "ANNOUNCEMENT_PUBLISH",
        allowed: true,
      });

    expect(permissionResponse.statusCode).toBe(200);
    expect(permissionResponse.body.membership.permissions.ANNOUNCEMENT_PUBLISH).toBe(true);

    const publishResponse = await memberAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "Allowed Announcement",
        content: "This should pass after permissions change.",
      });

    expect(publishResponse.statusCode).toBe(201);
  });
});
