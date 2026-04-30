const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    name: "FredoHub API",
    timestamp: new Date().toISOString(),
  });
});

module.exports = { app };
