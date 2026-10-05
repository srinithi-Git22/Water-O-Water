
const { parseBody } = require("../../http/parse-body");

const {
  sendJson,
  sendError,
} = require("../../http/send");

function registerOrderRoutes(
  router,
  services
) {
  /*
   * Get orders.
   *
   * Customer app sends:
   * /v1/orders?customerId=customer-id
   *
   * If customerId is not supplied, all orders
   * can be returned for supplier/admin workflows.
   */
  router.add(
    "GET",
    "/v1/orders",
    (req, res) => {
      try {
        const customerId =
          req.query?.customerId || null;

        const orders =
          services.orders.list(
            customerId
          );

        sendJson(res, 200, {
          data: orders,
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

  /*
   * Get one order by ID.
   */
  router.add(
    "GET",
    "/v1/orders/:id",
    (req, res) => {
      try {
        const order =
          services.orders.getById(
            req.params.id
          );

        if (!order) {
          sendError(
            res,
            404,
            "NOT_FOUND",
            "Order not found"
          );
          return;
        }

        sendJson(res, 200, {
          data: order,
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

  /*
   * Create a new order.
   */
  router.add(
    "POST",
    "/v1/orders",
    async (req, res) => {
      try {
        const body =
          await parseBody(req);

        const order =
          services.orders.place(
            body
          );

        sendJson(res, 201, {
          data: order,
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

  /*
   * Supplier accepts an order.
   */
  router.add(
    "POST",
    "/v1/orders/:id/accept",
    async (req, res) => {
      try {
        const body =
          await parseBody(req);

        const order =
          services.orders.transition(
            req.params.id,
            "accept",
            "owner",
            body.expectedVersion
          );

        sendJson(res, 200, {
          data: order,
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

  /*
   * Supplier declines an order.
   */
  router.add(
    "POST",
    "/v1/orders/:id/decline",
    async (req, res) => {
      try {
        const order =
          services.orders.transition(
            req.params.id,
            "decline",
            "owner"
          );

        sendJson(res, 200, {
          data: order,
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

  /*
   * Rider starts delivery.
   */
  router.add(
    "POST",
    "/v1/orders/:id/start",
    async (req, res) => {
      try {
        const order =
          services.orders.transition(
            req.params.id,
            "start",
            "rider"
          );

        sendJson(res, 200, {
          data: order,
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

  /*
   * Assign a real delivery partner to an order.
   *
   * Body:
   * {
   *   "deliveryPartnerId": "partner-id"
   * }
   */
  router.add(
    "POST",
    "/v1/orders/:id/assign-delivery-partner",
    async (req, res) => {
      try {
        const body =
          await parseBody(req);

        const order =
          services.orders.assignDeliveryPartner(
            req.params.id,
            body?.deliveryPartnerId
          );

        sendJson(res, 200, {
          data: order,
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
  registerOrderRoutes,
};
