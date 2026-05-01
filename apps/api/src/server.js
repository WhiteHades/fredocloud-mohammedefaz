const http = require("http");

const { app } = require("./app");
const { config } = require("./lib/env");
const { attachRealtime } = require("./lib/realtime");

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

attachRealtime(server, config.clientUrl);

server.listen(port, () => {
  console.log(`notFredoHub API listening on ${port}`);
});
