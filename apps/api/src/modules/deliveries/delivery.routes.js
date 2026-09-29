const { parseBody } = require("../../http/parse-body");
const { sendJson, sendError } = require("../../http/send");

function registerDeliveryRoutes(router, services) {
  router.add("POST", "/v1/deliveries", async (req, res) => {
    try {
      const body = await parseBody(req);
      const result = services.deliveries.record(body);
      sendJson(res, 201, { data: result });
    } catch (err) {
      sendError(res, err.status || 400, err.code || "VALIDATION", err.message);
    }
  });
}

module.exports = { registerDeliveryRoutes };
