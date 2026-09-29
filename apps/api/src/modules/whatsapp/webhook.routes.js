const { parseBody } = require("../../http/parse-body");
const { sendJson } = require("../../http/send");

function registerWhatsappRoutes(router, services) {
  router.add("GET", "/v1/webhooks/whatsapp", (req, res) => {
    sendJson(res, 200, { data: { challenge: req.query["hub.challenge"] || "ok" } });
  });

  router.add("POST", "/v1/webhooks/whatsapp", async (req, res) => {
    const body = await parseBody(req);
    const result = services.conversation.inbound(
      body.text,
      body.customerId || "cust-ayesha"
    );
    sendJson(res, 200, { data: result });
  });

  router.add("GET", "/v1/whatsapp/messages", (req, res) => {
    sendJson(res, 200, { data: services.store.waMessages });
  });
}

module.exports = { registerWhatsappRoutes };
