const http = require("http");
const fs = require("fs");
const path = require("path");

const webRoot = path.resolve(__dirname, "../apps/web");
const apiPort = Number(process.env.API_PORT || 3001);
const port = Number(process.env.WEB_PORT || 5173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function proxyApi(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: apiPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  const upstream = http.request(options, (up) => {
    res.writeHead(up.statusCode, up.headers);
    up.pipe(res);
  });
  upstream.on("error", () => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { code: "API_DOWN", message: "Start the API on port " + apiPort } }));
  });
  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname.startsWith("/v1/")) {
    proxyApi(req, res);
    return;
  }
  const rel = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
  const file = path.resolve(webRoot, rel);
  if (!file.startsWith(webRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "text/plain" });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("WoW web ready: http://127.0.0.1:" + port + "/");
});
