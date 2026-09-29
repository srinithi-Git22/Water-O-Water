const { parseBody } = require("../../http/parse-body");
const { sendJson, sendError } = require("../../http/send");

function registerOrderRoutes(router, services) {
  router.add("GET", "/v1/orders", (req, res) => {
    sendJson(res, 200, { data: services.orders.list() });
  });

  router.add("GET", "/v1/orders/:id", (req, res) => {
    const order = services.orders.getById(req.params.id);
    if (!order) {
      sendError(res, 404, "NOT_FOUND", "Order not found");
      return;
    }
    sendJson(res, 200, { data: order });
  });

  router.add("POST", "/v1/orders", async (req, res) => {
    const body = await parseBody(req);
    const order = services.orders.place(body);
    sendJson(res, 201, { data: order });
  });

  router.add("POST", "/v1/orders/:id/accept", async (req, res) => {
    try {
      const body = await parseBody(req);
      const order = services.orders.transition(
        req.params.id,
        "accept",
        "owner",
        body.expectedVersion
      );
      sendJson(res, 200, { data: order });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });

  router.add("POST", "/v1/orders/:id/decline", async (req, res) => {
    try {
      const order = services.orders.transition(req.params.id, "decline", "owner");
      sendJson(res, 200, { data: order });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });

  router.add("POST", "/v1/orders/:id/start", async (req, res) => {
    try {
      const order = services.orders.transition(req.params.id, "start", "rider");
      sendJson(res, 200, { data: order });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });
}

module.exports = { registerOrderRoutes };
