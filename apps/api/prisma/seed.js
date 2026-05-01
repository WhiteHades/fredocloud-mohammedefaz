const bcrypt = require("bcryptjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), quiet: true });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = process.env.DEMO_PASSWORD || "demo12345";
const SEED_EMAIL = process.env.DEMO_EMAIL || "demo@notfredohub.test";

const USERS = [
  { email: SEED_EMAIL, displayName: "Demo Admin", isOwner: true },
  { email: "priya@notfredohub.test", displayName: "Priya Sharma" },
  { email: "marcus@notfredohub.test", displayName: "Marcus Chen" },
  { email: "elena@notfredohub.test", displayName: "Elena Vasquez" },
  { email: "james@notfredohub.test", displayName: "James Okonkwo" },
  { email: "sofia@notfredohub.test", displayName: "Sofia Larsson" },
  { email: "akira@notfredohub.test", displayName: "Akira Tanaka" },
  { email: "fatima@notfredohub.test", displayName: "Fatima Al-Rashid" },
];

const WORKSPACES = [
  {
    name: "Engineering Hub",
    description: "Core product engineering for the notFredoHub platform. Backend, frontend, infrastructure, and developer experience.",
    accentColor: "#3b82f6",
    creatorEmail: SEED_EMAIL,
    members: [
      { email: SEED_EMAIL, role: "ADMIN" },
      { email: "marcus@notfredohub.test", role: "ADMIN" },
      { email: "elena@notfredohub.test", role: "MEMBER" },
      { email: "akira@notfredohub.test", role: "MEMBER" },
      { email: "fatima@notfredohub.test", role: "MEMBER" },
    ],
  },
  {
    name: "Design Studio",
    description: "Product design, UX research, brand identity, and design systems for all customer-facing surfaces.",
    accentColor: "#8b5cf6",
    creatorEmail: "priya@notfredohub.test",
    members: [
      { email: "priya@notfredohub.test", role: "ADMIN" },
      { email: "sofia@notfredohub.test", role: "ADMIN" },
      { email: "marcus@notfredohub.test", role: "MEMBER" },
      { email: SEED_EMAIL, role: "MEMBER" },
    ],
  },
  {
    name: "Product & Strategy",
    description: "Roadmap planning, competitive analysis, feature prioritisation, and cross-team coordination.",
    accentColor: "#f59e0b",
    creatorEmail: "james@notfredohub.test",
    members: [
      { email: "james@notfredohub.test", role: "ADMIN" },
      { email: SEED_EMAIL, role: "ADMIN" },
      { email: "priya@notfredohub.test", role: "MEMBER" },
      { email: "sofia@notfredohub.test", role: "MEMBER" },
    ],
  },
  {
    name: "Developer Relations",
    description: "Community engagement, documentation, tutorials, open-source contributions, and developer advocacy.",
    accentColor: "#10b981",
    creatorEmail: "elena@notfredohub.test",
    members: [
      { email: "elena@notfredohub.test", role: "ADMIN" },
      { email: "akira@notfredohub.test", role: "MEMBER" },
      { email: "fatima@notfredohub.test", role: "MEMBER" },
      { email: SEED_EMAIL, role: "MEMBER" },
    ],
  },
];

const GOAL_TEMPLATES = {
  "Engineering Hub": [
    { title: "Ship the realtime collaboration engine", status: "IN_PROGRESS", dueDays: 21, desc: "Build the WebSocket-backed live editing system for goal descriptions. Includes cursor presence, OT/CRDT merge logic, and conflict resolution UI.", milestones: [{ title: "WebSocket room scaffolding", pct: 100 }, { title: "Operational transform core", pct: 80 }, { title: "Cursor presence overlay", pct: 45 }, { title: "Conflict resolution modal", pct: 10 }, { title: "End-to-end integration tests", pct: 0 }], updates: ["WebSocket rooms are wired and auth is passing through correctly.", "OT core passes the 200-case test suite. Edge cases around concurrent deletes still being investigated.", "Cursor presence renders but flickers on rapid workspace switches."] },
    { title: "Migrate to Turborepo v3", status: "NOT_STARTED", dueDays: 35, desc: "Upgrade the monorepo toolchain to Turborepo v3, adopt the new task graph syntax, and enable remote caching for CI.", milestones: [{ title: "Audit current turbo.json", pct: 0 }, { title: "Run codemod for v3 syntax", pct: 0 }, { title: "Enable remote caching backend", pct: 0 }, { title: "Update CI pipeline configs", pct: 0 }], updates: [] },
    { title: "Reduce p95 API latency below 200ms", status: "AT_RISK", dueDays: 14, desc: "Profile all workspace-scoped queries, add missing database indexes, introduce Redis caching layer for member lists, and paginate announcement/audit endpoints.", milestones: [{ title: "Profile top 20 slow queries", pct: 100 }, { title: "Add compound indexes on workspace FK columns", pct: 100 }, { title: "Redis cache for member lists", pct: 0 }, { title: "Paginate announcement endpoint", pct: 30 }, { title: "Paginate audit endpoint", pct: 30 }], updates: ["Database indexes deployed — member list queries dropped from 340ms to 18ms.", "Redis cluster provisioning is blocked on infra ticket #ENG-442."] },
    { title: "SSO with SAML and OIDC", status: "COMPLETED", dueDays: -10, desc: "Add enterprise single sign-on support via SAML 2.0 and OpenID Connect. Support Okta, Azure AD, and Google Workspace as identity providers.", milestones: [{ title: "SAML SP metadata endpoint", pct: 100 }, { title: "OIDC discovery and callback", pct: 100 }, { title: "IdP configuration UI in settings", pct: 100 }, { title: "Just-in-time user provisioning", pct: 100 }], updates: ["SAML and OIDC flows are live for all three providers.", "Enterprise customers can now onboard without manual account creation."] },
  ],
  "Design Studio": [
    { title: "Design system v2 — Luma components", status: "IN_PROGRESS", dueDays: 28, desc: "Create the second major iteration of the Luma design system. Ship 40+ Figma components, document interaction patterns, and build a Storybook portal for engineering handoff.", milestones: [{ title: "Audit current Luma v1 components", pct: 100 }, { title: "Design 40 Figma components", pct: 65 }, { title: "Document interaction patterns", pct: 40 }, { title: "Storybook portal MVP", pct: 20 }, { title: "Engineering handoff review", pct: 0 }], updates: ["Figma audit complete — 28 v1 components identified for v2 refresh.", "22 out of 40 components designed and peer-reviewed."] },
    { title: "Onboarding UX overhaul", status: "NOT_STARTED", dueDays: 42, desc: "Redesign the first-run experience for new workspace members. Focus on progressive disclosure, contextual tooltips, and a guided tour that drops users into their first goal within 90 seconds.", milestones: [{ title: "User research synthesis", pct: 0 }, { title: "Wireframes for 5 key flows", pct: 0 }, { title: "High-fidelity prototypes", pct: 0 }, { title: "Usability testing with 12 participants", pct: 0 }], updates: [] },
  ],
  "Product & Strategy": [
    { title: "Q3 roadmap finalisation", status: "COMPLETED", dueDays: -5, desc: "Finalise the product roadmap for Q3. Align with engineering capacity planning, design resourcing, and executive stakeholder expectations.", milestones: [{ title: "Collect feature requests from all teams", pct: 100 }, { title: "Prioritise with RICE framework", pct: 100 }, { title: "Present to exec team", pct: 100 }, { title: "Publish public-facing roadmap page", pct: 100 }], updates: ["Roadmap approved by exec team with 3 strategic bets for Q3.", "Public roadmap page is live on notfredohub.com/roadmap."] },
    { title: "Competitive landscape analysis", status: "IN_PROGRESS", dueDays: 20, desc: "Deep-dive analysis of 6 key competitors. Document feature matrices, pricing models, UX patterns, and identify gaps where notFredoHub can differentiate.", milestones: [{ title: "Select 6 target competitors", pct: 100 }, { title: "Feature matrix spreadsheet", pct: 80 }, { title: "Pricing comparison table", pct: 60 }, { title: "UX teardown for top 3", pct: 30 }, { title: "Differentiation strategy doc", pct: 0 }], updates: ["Six competitors selected: Linear, Basecamp, Monday, Asana, Notion, ClickUp.", "Feature matrix is 80% complete — Linear analysis pending."] },
    { title: "Customer advisory board launch", status: "NOT_STARTED", dueDays: 60, desc: "Recruit 8-12 power users for a quarterly advisory board. Structure feedback sessions, create a private feedback workspace, and publish quarterly CAB reports.", milestones: [{ title: "Define CAB charter and scope", pct: 0 }, { title: "Recruit 12 founding members", pct: 0 }, { title: "Kickoff session facilitation guide", pct: 0 }], updates: [] },
  ],
  "Developer Relations": [
    { title: "Public API documentation site", status: "IN_PROGRESS", dueDays: 15, desc: "Build a dedicated documentation microsite with interactive API explorer, code snippets in 5 languages, and step-by-step integration guides for new developers.", milestones: [{ title: "OpenAPI spec coverage audit", pct: 100 }, { title: "Code snippet generator for 5 languages", pct: 75 }, { title: "Integration guide — authentication", pct: 100 }, { title: "Integration guide — webhooks", pct: 50 }, { title: "Deploy to docs.notfredohub.com", pct: 0 }], updates: ["OpenAPI spec now covers 23 endpoints with request/response schemas.", "Authentication guide published — covers JWT, OAuth, and API key flows."] },
    { title: "Community forum migration", status: "COMPLETED", dueDays: -12, desc: "Migrate the community from Discord to a self-hosted Discourse instance. Preserve all historical threads, user profiles, and badges.", milestones: [{ title: "Discourse instance provisioned", pct: 100 }, { title: "Data export from Discord", pct: 100 }, { title: "Import and verify 4,200 threads", pct: 100 }, { title: "SSO integration with notFredoHub auth", pct: 100 }, { title: "Redirect old Discord links", pct: 100 }], updates: ["Migration complete. 4,200 threads, 890 users, and all badges preserved.", "Community engagement is up 34% week-over-week on the new platform."] },
  ],
};

const ANNOUNCEMENT_TEMPLATES = {
  "Engineering Hub": [
    { title: "Production deploy — v2.4.0 is live", content: "<p>We just shipped <strong>v2.4.0</strong> to production. This release includes:</p><ul><li>Realtime collaboration engine (beta)</li><li>Redis caching layer for member lists</li><li>Audit timeline CSV export</li><li>18 bug fixes and 7 performance improvements</li></ul><p>The rollout will complete across all regions within the next 2 hours. Check the <em>#eng-releases</em> channel for detailed changelogs.</p>", pinned: true, reactionProb: 0.9, commentProb: 0.7 },
    { title: "Database maintenance window — Saturday 02:00 UTC", content: "<p>We will perform a <strong>scheduled database maintenance</strong> this Saturday at 02:00 UTC. Expected downtime: 15-20 minutes.</p><p>During this window we will:</p><ul><li>Upgrade PostgreSQL from 16.1 to 16.4</li><li>Add a read replica for analytics queries</li><li>Rotate encryption keys</li></ul><p>All workspaces will be placed in read-only mode 5 minutes before the window begins.</p>", pinned: false, reactionProb: 0.5, commentProb: 0.2 },
    { title: "Welcome Akira Tanaka — new infrastructure engineer", content: "<p>Please join us in welcoming <strong>Akira Tanaka</strong> to the Engineering team! Akira joins us from Vercel where they worked on edge infrastructure and CDN optimisation. They will be focusing on:</p><ul><li>CI/CD pipeline reliability</li><li>Multi-region deployment strategy</li><li>Observability and alerting infrastructure</li></ul><p>Say hello in #eng-introductions!</p>", pinned: false, reactionProb: 1.0, commentProb: 0.8 },
  ],
  "Design Studio": [
    { title: "Luma v2 component library — preview now available", content: "<p>The <strong>Luma v2</strong> component library is ready for early preview. We have rebuilt 22 of 40 planned components with:</p><ul><li>Improved accessibility (WCAG 2.2 AA compliance)</li><li>Motion design tokens for consistent animation curves</li><li>Dark mode variants for every component</li><li>Reduced bundle size (~40% smaller than v1)</li></ul><p>Visit the <em>Storybook preview</em> to explore the new components and leave feedback.</p>", pinned: true, reactionProb: 0.8, commentProb: 0.5 },
    { title: "Design critique session — Friday 15:00 UTC", content: "<p>Weekly design critique this Friday at 15:00 UTC. This week we are reviewing:</p><ol><li>Onboarding flow wireframes (Sofia)</li><li>Analytics dashboard redesign (Priya)</li><li>Mobile navigation patterns research</li></ol><p>All designers and interested engineers are welcome. Bring constructive feedback and an open mind.</p>", pinned: false, reactionProb: 0.4, commentProb: 0.3 },
  ],
  "Product & Strategy": [
    { title: "Q3 strategic bets — executive summary", content: "<p>The executive team has approved our <strong>three strategic bets</strong> for Q3:</p><ol><li><strong>Enterprise SSO &amp; compliance</strong> — SAML/OIDC, audit logging, SOC 2 certification</li><li><strong>Realtime collaboration</strong> — Live cursors, concurrent editing, presence awareness</li><li><strong>API-first platform</strong> — Public REST API, webhooks, developer portal</li></ol><p>Each bet has dedicated engineering, design, and PM allocation. Quarterly checkpoints at weeks 4, 8, and 12.</p>", pinned: true, reactionProb: 0.9, commentProb: 0.6 },
  ],
  "Developer Relations": [
    { title: "notFredoHub at DevWorld Conference — call for speakers", content: "<p>We have a <strong>gold sponsor booth</strong> at DevWorld Conference in Berlin (October 12-14). We are looking for:</p><ul><li>2 technical talk speakers (30 min slots)</li><li>4 workshop facilitators (90 min hands-on labs)</li><li>Booth volunteers for all 3 days</li></ul><p>Submit your talk proposals by <strong>September 1st</strong>. Travel and accommodation covered for all speakers.</p>", pinned: false, reactionProb: 0.7, commentProb: 0.5 },
  ],
};

const ACTION_ITEM_TEMPLATES = {
  "Engineering Hub": [
    { title: "Fix WebSocket reconnection on workspace switch", status: "TODO", priority: "HIGH", assigneeEmail: "akira@notfredohub.test", dueDays: 3 },
    { title: "Write integration tests for announcement reactions", status: "TODO", priority: "MEDIUM", assigneeEmail: "fatima@notfredohub.test", dueDays: 5 },
    { title: "Add pagination to /api/announcements endpoint", status: "IN_PROGRESS", priority: "HIGH", assigneeEmail: "elena@notfredohub.test", dueDays: 2 },
    { title: "Profile and optimise the goal detail query", status: "IN_PROGRESS", priority: "HIGH", assigneeEmail: "marcus@notfredohub.test", dueDays: 4 },
    { title: "Set up Sentry error tracking for API service", status: "BLOCKED", priority: "MEDIUM", assigneeEmail: "akira@notfredohub.test", dueDays: 7 },
    { title: "Deploy Redis cluster to staging", status: "DONE", priority: "HIGH", assigneeEmail: "elena@notfredohub.test", dueDays: -2 },
    { title: "Review and merge PR #342 — audit CSV export", status: "DONE", priority: "MEDIUM", assigneeEmail: "marcus@notfredohub.test", dueDays: -1 },
    { title: "Update Prisma to v7.8 and fix breaking changes", status: "DONE", priority: "LOW", assigneeEmail: "fatima@notfredohub.test", dueDays: -5 },
    { title: "Draft engineering RFC for plugin architecture", status: "TODO", priority: "LOW", assigneeEmail: SEED_EMAIL, dueDays: 14 },
    { title: "Implement rate limiting on auth endpoints", status: "TODO", priority: "CRITICAL", assigneeEmail: "marcus@notfredohub.test", dueDays: 7 },
  ],
  "Design Studio": [
    { title: "Create dark mode variants for all 22 new components", status: "IN_PROGRESS", priority: "HIGH", assigneeEmail: "sofia@notfredohub.test", dueDays: 5 },
    { title: "Conduct accessibility audit on Luma v2", status: "TODO", priority: "MEDIUM", assigneeEmail: "priya@notfredohub.test", dueDays: 10 },
    { title: "Design empty state illustrations for dashboard", status: "TODO", priority: "LOW", assigneeEmail: "sofia@notfredohub.test", dueDays: 8 },
    { title: "Update Figma component library with v2 tokens", status: "DONE", priority: "HIGH", assigneeEmail: "priya@notfredohub.test", dueDays: -3 },
  ],
  "Product & Strategy": [
    { title: "Schedule Q3 check-in meetings with all team leads", status: "TODO", priority: "HIGH", assigneeEmail: "james@notfredohub.test", dueDays: 2 },
    { title: "Draft competitive differentiation one-pager", status: "IN_PROGRESS", priority: "HIGH", assigneeEmail: "james@notfredohub.test", dueDays: 5 },
    { title: "Analyse user feedback from NPS survey", status: "TODO", priority: "MEDIUM", assigneeEmail: "sofia@notfredohub.test", dueDays: 10 },
  ],
  "Developer Relations": [
    { title: "Write Node.js SDK getting-started guide", status: "DONE", priority: "HIGH", assigneeEmail: "elena@notfredohub.test", dueDays: -1 },
    { title: "Record video walkthrough for API authentication", status: "IN_PROGRESS", priority: "MEDIUM", assigneeEmail: "akira@notfredohub.test", dueDays: 3 },
    { title: "Prepare DevWorld workshop materials", status: "TODO", priority: "HIGH", assigneeEmail: "elena@notfredohub.test", dueDays: 20 },
  ],
};

const COMMENT_SAMPLES = [
  "Great update! Looking forward to seeing this in production.",
  "Has this been tested with the new WebSocket implementation yet?",
  "I have some concerns about the timeline — can we discuss in the standup tomorrow?",
  "The design looks clean. One minor suggestion: increase the contrast on the muted text for better accessibility.",
  "This is exactly what we needed. Thanks for the quick turnaround!",
  "Should we create a separate action item to track the follow-up tasks from this?",
  "I reviewed the implementation and left comments on the PR. Overall looks solid.",
  "The performance numbers are impressive. What profiling tool did you use?",
  "Can we add a dark mode toggle to the settings panel before the release?",
  "@marcus can you take a look at the edge case I mentioned in Slack?",
  "@priya the new component tokens look great in the preview. Ship it!",
  "Let us schedule a quick sync to align on the rollout plan.",
  "Documentation for this feature is now live at /docs/realtime.",
  "I am seeing a minor rendering glitch on Safari 17. I will file a bug report.",
  "This unblocks the entire Q3 roadmap. Excellent work everyone.",
];

const REACTION_EMOJIS = ["🔥", "👏", "✅", "📌", "🚀", "💯", "🎉", "❤️"];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function pickRandom(array, count = 1) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

async function main() {
  console.log("Seeding notFredoHub demo data...\n");

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const userMap = new Map();
  for (const userDef of USERS) {
    const user = await prisma.user.upsert({
      where: { email: userDef.email },
      update: { displayName: userDef.displayName, passwordHash },
      create: { email: userDef.email, displayName: userDef.displayName, passwordHash },
    });
    userMap.set(user.email, user);
    console.log(`  User: ${user.displayName} (${user.email})`);
  }

  console.log("");

  const allMembershipIds = new Map();

  for (const wsDef of WORKSPACES) {
    const existing = await prisma.workspace.findFirst({ where: { name: wsDef.name } });
    if (existing) {
      console.log(`  Workspace "${wsDef.name}" already exists — skipping.`);
      const memberships = await prisma.membership.findMany({
        where: { workspaceId: existing.id },
      });
      for (const m of memberships) {
        allMembershipIds.set(`${existing.id}:${m.userId}`, m.id);
      }
      continue;
    }

    const creator = userMap.get(wsDef.creatorEmail);
    const workspace = await prisma.workspace.create({
      data: {
        name: wsDef.name,
        description: wsDef.description,
        accentColor: wsDef.accentColor,
        createdById: creator.id,
        memberships: {
          create: wsDef.members.map((m) => ({
            userId: userMap.get(m.email).id,
            role: m.role,
          })),
        },
      },
      include: { memberships: { include: { user: true } } },
    });

    console.log(`  Workspace: "${workspace.name}" (${workspace.memberships.length} members)`);

    const membershipMap = new Map();
    for (const m of workspace.memberships) {
      membershipMap.set(m.user.email, m);
      allMembershipIds.set(`${workspace.id}:${m.userId}`, m.id);
    }

    const goals = GOAL_TEMPLATES[workspace.name] || [];
    for (const goalDef of goals) {
      const ownerMembership = pickRandom(workspace.memberships);
      const goal = await prisma.goal.create({
        data: {
          workspaceId: workspace.id,
          ownerMembershipId: ownerMembership.id,
          title: goalDef.title,
          description: goalDef.desc || null,
          status: goalDef.status,
          dueDate: goalDef.dueDays ? daysFromNow(goalDef.dueDays + Math.floor(Math.random() * 10) - 5) : null,
        },
      });

      for (const msDef of goalDef.milestones || []) {
        await prisma.milestone.create({
          data: {
            goalId: goal.id,
            title: msDef.title,
            progressPercentage: msDef.pct,
            sortOrder: 0,
          },
        });
      }

      for (const updateText of goalDef.updates || []) {
        const author = pickRandom(workspace.memberships);
        await prisma.goalUpdate.create({
          data: {
            goalId: goal.id,
            authorMembershipId: author.id,
            content: updateText,
            createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
          },
        });
      }
    }

    console.log(`    ${goals.length} goals created`);

    const announcements = ANNOUNCEMENT_TEMPLATES[workspace.name] || [];
    for (const annDef of announcements) {
      const author = pickRandom(
        workspace.memberships.filter((m) => m.role === "ADMIN"),
      );
      const announcement = await prisma.announcement.create({
        data: {
          workspaceId: workspace.id,
          authorMembershipId: author.id,
          title: annDef.title,
          content: annDef.content,
          pinned: annDef.pinned || false,
          createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
        },
      });

      for (const member of pickRandom(workspace.memberships, Math.floor(Math.random() * workspace.memberships.length) + 1)) {
        if (Math.random() < (annDef.reactionProb || 0.3)) {
          const emoji = pickRandom(REACTION_EMOJIS);
          await prisma.announcementReaction.create({
            data: {
              announcementId: announcement.id,
              membershipId: member.id,
              emoji,
            },
          }).catch(() => {});
        }
      }

      const commentCount = Math.floor(Math.random() * 5) + (annDef.commentProb > 0.5 ? 2 : 0);
      for (let i = 0; i < commentCount; i++) {
        const commentAuthor = pickRandom(workspace.memberships);
        const commentText = pickRandom(COMMENT_SAMPLES);
        await prisma.announcementComment.create({
          data: {
            announcementId: announcement.id,
            authorMembershipId: commentAuthor.id,
            content: commentText,
            createdAt: daysAgo(Math.floor(Math.random() * 18) + 1),
          },
        });
      }
    }

    console.log(`    ${announcements.length} announcements created`);

    const items = ACTION_ITEM_TEMPLATES[workspace.name] || [];
    for (const itemDef of items) {
      const assigneeMembership = membershipMap.get(itemDef.assigneeEmail);
      const parentGoal = pickRandom(goals.length ? goals : [null]);
      await prisma.actionItem.create({
        data: {
          workspaceId: workspace.id,
          goalId: parentGoal?.id || null,
          assigneeMembershipId: assigneeMembership?.id || workspace.memberships[0].id,
          title: itemDef.title,
          status: itemDef.status,
          priority: itemDef.priority === "CRITICAL" ? "CRITICAL" : itemDef.priority,
          dueDate: daysFromNow(itemDef.dueDays + Math.floor(Math.random() * 6) - 3),
        },
      });
    }

    console.log(`    ${items.length} action items created`);

    const adminMembership = workspace.memberships.find((m) => m.role === "ADMIN");
    const memberMembership = workspace.memberships.find((m) => m.role === "MEMBER");
    if (adminMembership && memberMembership) {
      await prisma.membershipPermission.upsert({
        where: {
          membershipId_permission: {
            membershipId: memberMembership.id,
            permission: "ANNOUNCEMENT_PUBLISH",
          },
        },
        update: { allowed: false },
        create: {
          membershipId: memberMembership.id,
          permission: "ANNOUNCEMENT_PUBLISH",
          allowed: false,
        },
      });
    }

    await prisma.notification.createMany({
      data: pickRandom(workspace.memberships, Math.min(3, workspace.memberships.length)).map((member) => ({
        workspaceId: workspace.id,
        userId: member.userId,
        type: "MENTION",
        title: `You were mentioned in "${pickRandom(announcements)?.title || "a discussion"}"`,
        body: pickRandom(COMMENT_SAMPLES),
        link: "/dashboard",
        createdAt: daysAgo(Math.floor(Math.random() * 5) + 1),
      })),
    });

    console.log("");
  }

  await prisma.$disconnect();
  console.log("Seed complete. All demo data is ready.\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
