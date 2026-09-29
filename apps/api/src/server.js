const http = require("http");
const config = require("./config");
const { createApp, handleRequest } = require("./app");

const app = createApp();
const server = http.createServer((req, res) => {
  handleRequest(app, req, res);
});

server.listen(config.port, config.host, () => {
  console.log("WoW API ready: http://" + config.host + ":" + config.port + "/v1/health");
});
