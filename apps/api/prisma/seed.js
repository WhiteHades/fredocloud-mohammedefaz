const bcrypt = require("bcryptjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), quiet: true });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const demoUserEmail = process.env.DEMO_EMAIL || "demo@fredohub.test";
const demoPassword = process.env.DEMO_PASSWORD || "demo12345";

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {
      displayName: "Demo Admin",
      passwordHash,
    },
    create: {
      email: demoUserEmail,
      displayName: "Demo Admin",
      passwordHash,
    },
  });

  const existingMembership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      workspace: {
        name: "FredoHub Demo Workspace",
      },
    },
  });

  if (!existingMembership) {
    const workspace = await prisma.workspace.create({
      data: {
        name: "FredoHub Demo Workspace",
        description: "Seeded workspace for evaluator review.",
        accentColor: "#c8102e",
        createdById: user.id,
        memberships: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    const membership = workspace.memberships[0];

    const goal = await prisma.goal.create({
      data: {
        workspaceId: workspace.id,
        ownerMembershipId: membership.id,
        title: "Ship the evaluator demo",
        description: "A seeded goal that shows the dashboard surfaces immediately.",
        status: "IN_PROGRESS",
      },
    });

    await prisma.milestone.createMany({
      data: [
        {
          goalId: goal.id,
          title: "Model the product core",
          progressPercentage: 100,
        },
        {
          goalId: goal.id,
          title: "Polish the workspace surfaces",
          progressPercentage: 65,
        },
      ],
    });

    await prisma.goalUpdate.create({
      data: {
        goalId: goal.id,
        authorMembershipId: membership.id,
        content: "The demo workspace is seeded and ready for review.",
      },
    });

    await prisma.announcement.create({
      data: {
        workspaceId: workspace.id,
        authorMembershipId: membership.id,
        title: "Welcome to FredoHub",
        content: "This seeded workspace exists so evaluators can inspect the main surfaces without manual setup.",
        pinned: true,
      },
    });

    await prisma.actionItem.createMany({
      data: [
        {
          workspaceId: workspace.id,
          goalId: goal.id,
          assigneeMembershipId: membership.id,
          title: "Review the dashboard",
          status: "DONE",
          priority: "HIGH",
        },
        {
          workspaceId: workspace.id,
          goalId: goal.id,
          assigneeMembershipId: membership.id,
          title: "Inspect the audit timeline",
          status: "TODO",
          priority: "MEDIUM",
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
