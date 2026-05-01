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
const { specification } = require("./lib/openapi");

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specification));

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
  response.redirect(301, "https://web-production-7acc2.up.railway.app");
});

module.exports = { app };
