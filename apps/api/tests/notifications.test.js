const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("notification routes", () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany();
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

  it("creates an in-app notification when a teammate is mentioned in a comment", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "notify-admin@notfredohub.test",
      password: "password123",
      displayName: "Notify Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Notify",
      description: "Mention notification workspace.",
      accentColor: "#c8102e",
    });

    const invitationResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "notify-member@notfredohub.test",
        role: "MEMBER",
      });

    const announcementResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "Mention Thread",
        content: "Watch the comments here.",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "notify-member@notfredohub.test",
      password: "password123",
      displayName: "Notify Member",
    });

    await memberAgent.post(`/api/workspaces/invitations/${invitationResponse.body.invitation.id}/accept`);

    await adminAgent.post(`/api/announcements/${announcementResponse.body.announcement.id}/comments`).send({
      content: "@notify-member please review the launch copy.",
    });

    const notificationsResponse = await memberAgent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/notifications`,
    );

    expect(notificationsResponse.statusCode).toBe(200);
    expect(notificationsResponse.body.notifications).toHaveLength(1);
    expect(notificationsResponse.body.notifications[0].type).toBe("MENTION");
  });
});
