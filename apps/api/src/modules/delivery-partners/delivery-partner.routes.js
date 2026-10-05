
const { parseBody } = require("../../http/parse-body");
const { sendJson, sendError } = require("../../http/send");

function registerDeliveryPartnerRoutes(router, services) {
  router.add(
    "GET",
    "/v1/delivery-partners",
    (req, res) => {
      try {
        const supplierId =
          req.query?.supplierId || null;

        const partners =
          services.deliveryPartners.list(
            supplierId
          );

        sendJson(res, 200, {
          data: partners,
        });
      } catch (err) {
        sendError(
          res,
          err.status || 400,
          err.code || "VALIDATION",
          err.message
        );
      }
    }
  );

  router.add(
    "POST",
    "/v1/delivery-partners",
    async (req, res) => {
      try {
        const body =
          await parseBody(req);

        const partner =
          services.deliveryPartners.create(
            body
          );

        sendJson(res, 201, {
          data: partner,
        });
      } catch (err) {
        sendError(
          res,
          err.status || 400,
          err.code || "VALIDATION",
          err.message
        );
      }
    }
  );
}

module.exports = {
  registerDeliveryPartnerRoutes,
};

