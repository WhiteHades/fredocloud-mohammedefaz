const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const {
  actionItemActionsRouter,
  workspaceActionItemsRouter,
} = require("./modules/action-items/action-items.routes");
const { authRouter } = require("./modules/auth/auth.routes");
const {
  announcementActionsRouter,
  workspaceAnnouncementsRouter,
} = require("./modules/announcements/announcements.routes");
const { goalDetailRouter, goalsRouter } = require("./modules/goals/goals.routes");
const { workspacesRouter } = require("./modules/workspaces/workspaces.routes");
const { config } = require("./lib/env");

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/action-items", actionItemActionsRouter);
app.use("/api/auth", authRouter);
app.use("/api/announcements", announcementActionsRouter);
app.use("/api/goals", goalDetailRouter);
app.use("/api/workspaces/:workspaceId/action-items", workspaceActionItemsRouter);
app.use("/api/workspaces/:workspaceId/announcements", workspaceAnnouncementsRouter);
app.use("/api/workspaces/:workspaceId/goals", goalsRouter);
app.use("/api/workspaces", workspacesRouter);

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    name: "FredoHub API",
    timestamp: new Date().toISOString(),
  });
});

module.exports = { app };
