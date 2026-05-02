const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const {
  actionItemActionsRouter,
  workspaceActionItemsRouter,
} = require("./modules/action-items/action-items.routes");
const { workspaceAuditRouter } = require("./modules/audit/audit.routes");
const { workspaceAnalyticsRouter } = require("./modules/analytics/analytics.routes");
const { authRouter } = require("./modules/auth/auth.routes");
const { workspaceNotificationsRouter } = require("./modules/notifications/notifications.routes");
const {
  announcementActionsRouter,
  workspaceAnnouncementsRouter,
} = require("./modules/announcements/announcements.routes");
const { goalDetailRouter, goalsRouter } = require("./modules/goals/goals.routes");
const { workspacesRouter } = require("./modules/workspaces/workspaces.routes");
const { config } = require("./lib/env");
const { hasEmailTransport, sendEmail } = require("./lib/email");
const { requireAuth } = require("./middleware/require-auth");
const { specification } = require("./lib/openapi");

const allowedOrigins = [
  config.clientUrl,
  "https://web-production-7acc2.up.railway.app",
  "https://notfredohub.mohammedefaz.com",
  "http://localhost:3000",
];

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, (request, _response, next) => {
  if (!request.path.endsWith("/")) {
    request.url = request.url.replace("/api/docs", "/api/docs/");
  }
  next();
}, swaggerUi.setup(specification, { customSiteTitle: "notFredoHub API Docs" }));

app.use("/api/action-items", actionItemActionsRouter);
app.use("/api/auth", authRouter);
app.use("/api/announcements", announcementActionsRouter);
app.use("/api/goals", goalDetailRouter);
app.use("/api/workspaces/:workspaceId/action-items", workspaceActionItemsRouter);
app.use("/api/workspaces/:workspaceId/audit-events", workspaceAuditRouter);
app.use("/api/workspaces/:workspaceId/analytics", workspaceAnalyticsRouter);
app.use("/api/workspaces/:workspaceId/announcements", workspaceAnnouncementsRouter);
app.use("/api/workspaces/:workspaceId/goals", goalsRouter);
app.use("/api/workspaces/:workspaceId/notifications", workspaceNotificationsRouter);
app.use("/api/workspaces", workspacesRouter);

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    name: "notFredoHub API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_request, response) => {
  response.redirect(301, config.clientUrl);
});

app.post("/api/test/email", requireAuth, async (request, response) => {
  if (!hasEmailTransport()) {
    return response.status(503).json({ error: "Email is not configured. Set RESEND_API_KEY and SMTP_FROM." });
  }

  const to = request.body.to || request.auth.email;

  try {
    const result = await sendEmail({
      to,
      subject: "notFredoHub email test",
      html: `<p>Hi! This is a test email from <strong>notFredoHub</strong>. If you're reading this, email delivery is working. Sent at ${new Date().toISOString()}.</p>`,
    });

    return response.status(200).json({ success: true, to, ...result });
  } catch (error) {
    return response.status(500).json({ error: error.message, details: error.toString() });
  }
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled error:", error);
  response.status(500).json({ error: error.message || "Internal Server Error" });
});

module.exports = { app };
