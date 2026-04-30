const request = require("supertest");

const { prisma } = require("../src/lib/prisma");
const { app } = require("../src/app");

describe("announcement routes", () => {
  beforeEach(async () => {
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

  it("lets an admin publish and pin an announcement", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "announce-admin@fredohub.test",
      password: "password123",
      displayName: "Announcement Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Broadcast",
      description: "Announcement workspace.",
      accentColor: "#c8102e",
    });

    const createResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "Launch Day",
        content: "The workspace-wide announcement is now live.",
        pinned: true,
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.announcement.pinned).toBe(true);

    const listResponse = await adminAgent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`,
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.announcements[0].title).toBe("Launch Day");
  });

  it("lets an admin toggle an announcement pin state", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "pin-admin@fredohub.test",
      password: "password123",
      displayName: "Pin Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Pin",
      description: "Pinned announcement workspace.",
      accentColor: "#f0b429",
    });

    const createResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "A movable announcement",
        content: "This starts unpinned.",
      });

    const toggleResponse = await adminAgent
      .patch(`/api/announcements/${createResponse.body.announcement.id}`)
      .send({ pinned: true });

    expect(toggleResponse.statusCode).toBe(200);
    expect(toggleResponse.body.announcement.pinned).toBe(true);
  });

  it("lets a member react to and comment on an announcement", async () => {
    const adminAgent = request.agent(app);

    await adminAgent.post("/api/auth/register").send({
      email: "social-admin@fredohub.test",
      password: "password123",
      displayName: "Social Admin",
    });

    const workspaceResponse = await adminAgent.post("/api/workspaces").send({
      name: "Studio Social",
      description: "Social announcement workspace.",
      accentColor: "#003b8e",
    });

    const invitationResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/invitations`)
      .send({
        email: "social-member@fredohub.test",
        role: "MEMBER",
      });

    const announcementResponse = await adminAgent
      .post(`/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`)
      .send({
        title: "Status Update",
        content: "Members can now join the conversation.",
      });

    const memberAgent = request.agent(app);

    await memberAgent.post("/api/auth/register").send({
      email: "social-member@fredohub.test",
      password: "password123",
      displayName: "Social Member",
    });

    await memberAgent.post(`/api/workspaces/invitations/${invitationResponse.body.invitation.id}/accept`);

    const reactionResponse = await memberAgent
      .post(`/api/announcements/${announcementResponse.body.announcement.id}/reactions`)
      .send({ emoji: "🔥" });

    expect(reactionResponse.statusCode).toBe(200);
    expect(reactionResponse.body.reacted).toBe(true);

    const commentResponse = await memberAgent
      .post(`/api/announcements/${announcementResponse.body.announcement.id}/comments`)
      .send({ content: "This is ready for the whole workspace." });

    expect(commentResponse.statusCode).toBe(201);

    const listResponse = await memberAgent.get(
      `/api/workspaces/${workspaceResponse.body.workspace.id}/announcements`,
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.announcements[0].reactions).toHaveLength(1);
    expect(listResponse.body.announcements[0].comments).toHaveLength(1);
  });
});
