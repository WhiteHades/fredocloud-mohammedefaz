const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { authRouter } = require("./modules/auth/auth.routes");
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

app.use("/api/auth", authRouter);
app.use("/api/goals", goalDetailRouter);
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
