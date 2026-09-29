const { sendJson } = require("../../http/send");

function registerCatalogRoutes(router, store) {
  router.add("GET", "/v1/health", (req, res) => {
    sendJson(res, 200, { data: { ok: true, service: "wow-api" } });
  });

  router.add("GET", "/v1/suppliers", (req, res) => {
    sendJson(res, 200, { data: store.suppliers });
  });

  router.add("GET", "/v1/customers", (req, res) => {
    sendJson(res, 200, { data: store.customers });
  });

  router.add("GET", "/v1/products", (req, res) => {
    sendJson(res, 200, { data: store.products });
  });

  router.add("GET", "/v1/bootstrap", (req, res) => {
    sendJson(res, 200, {
      data: {
        customer: store.customers[0],
        address: store.addresses[0],
        suppliers: store.suppliers,
        products: store.products,
        orders: store.orders.slice().reverse(),
        events: store.orderEvents,
      },
    });
  });
}

module.exports = { registerCatalogRoutes };
