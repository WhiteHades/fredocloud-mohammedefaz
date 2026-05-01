const http = require("http");
const { execSync } = require("child_process");

const { app } = require("./app");
const { config } = require("./lib/env");
const { attachRealtime } = require("./lib/realtime");

try {
  execSync("node prisma/seed.js", { cwd: require("path").resolve(__dirname, ".."), stdio: "inherit" });
  console.log("Demo seed completed.");
} catch {
  console.log("Demo seed skipped (database may not be ready or already seeded).");
}

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

attachRealtime(server, config.clientUrl);

server.listen(port, () => {
  console.log(`notFredoHub API listening on ${port}`);
});
