const { parseBody } = require("../../http/parse-body");
const { sendJson, sendError } = require("../../http/send");

function registerFallbackRoutes(router, services) {
  router.add("GET", "/v1/ops/fallback-queue", (req, res) => {
    sendJson(res, 200, { data: services.fallback.queue() });
  });

  router.add("POST", "/v1/orders/:id/timeout", (req, res) => {
    try {
      const order = services.fallback.offerBackup(req.params.id);
      sendJson(res, 200, { data: order });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });

  router.add("POST", "/v1/orders/:id/fallback-yes", (req, res) => {
    try {
      const order = services.fallback.customerYes(req.params.id);
      sendJson(res, 200, { data: order });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });

  router.add("POST", "/v1/ops/orders/:id/fallback-assign", async (req, res) => {
    try {
      const body = await parseBody(req);
      const order = services.fallback.assign(
        req.params.id,
        body.supplierId || "sup-balaji"
      );
      sendJson(res, 200, { data: order });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });
}

module.exports = { registerFallbackRoutes };
