
const http = require("http");
const config = require("./config");
const { createApp, handleRequest } = require("./app");

const app = createApp();

const server = http.createServer((req, res) => {
  console.log(
  "API REQUEST:",
  req.method,
  req.url
);
  // Allow browser and Expo web requests to access the API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle browser CORS preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  handleRequest(app, req, res);
});

server.listen(config.port, config.host, () => {
  console.log(
    "WoW API ready: http://" +
      config.host +
      ":" +
      config.port +
      "/v1/health"
  );
});

