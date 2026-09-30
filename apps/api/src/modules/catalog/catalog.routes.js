const { sendJson, sendError } = require("../../http/send");
const { parseBody } = require("../../http/parse-body");

function registerCatalogRoutes(router, store, db) {
  router.add("GET", "/v1/health", (req, res) => {
    sendJson(res, 200, { data: { ok: true } });
  });

  router.add("GET", "/v1/suppliers", (req, res) => {
    sendJson(res, 200, { data: store.suppliers });
  });

  router.add("GET", "/v1/customers", (req, res) => {
    sendJson(res, 200, { data: store.customers });
  });

  router.add("GET", "/v1/products", (req, res) => {
    const products = db
      .prepare(`
        SELECT
          id,
          supplier_id AS supplierId,
          sku,
          name_en AS nameEn,
          name_ta AS nameTa,
          unit_price_paise AS unitPricePaise,
          service_type AS serviceType
        FROM products
        ORDER BY name_en
      `)
      .all();

    sendJson(res, 200, { data: products });
  });

  router.add("POST", "/v1/products", async (req, res) => {
    try {
      const body = await parseBody(req);

      const name = String(body.name || "").trim();
      const sku = String(body.sku || "").trim();
      const price = Number(body.price);

      if (!name) {
        sendError(res, 400, "VALIDATION", "Product name is required");
        return;
      }

      if (!sku) {
        sendError(res, 400, "VALIDATION", "SKU is required");
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        sendError(res, 400, "VALIDATION", "Valid price is required");
        return;
      }

      const existing = db
        .prepare("SELECT id FROM products WHERE sku = ?")
        .get(sku);

      if (existing) {
        sendError(res, 409, "DUPLICATE_SKU", "SKU already exists");
        return;
      }

      const id =
        "prod-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 8);

      db.prepare(`
        INSERT INTO products
        (
          id,
          supplier_id,
          sku,
          name_en,
          name_ta,
          unit_price_paise,
          service_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        "sup-murugan",
        sku,
        name,
        name,
        Math.round(price * 100),
        "exchange"
      );

      const product = db
        .prepare(`
          SELECT
            id,
            supplier_id AS supplierId,
            sku,
            name_en AS nameEn,
            name_ta AS nameTa,
            unit_price_paise AS unitPricePaise,
            service_type AS serviceType
          FROM products
          WHERE id = ?
        `)
        .get(id);

      sendJson(res, 201, { data: product });
    } catch (err) {
      sendError(res, 400, "VALIDATION", err.message);
    }
  });

  router.add("DELETE", "/v1/products/:id", (req, res) => {
    try {
      console.log("DELETE PRODUCT:", req.params.id);

      const product = db
        .prepare("SELECT id FROM products WHERE id = ?")
        .get(req.params.id);

      console.log("PRODUCT FOUND:", product);

      if (!product) {
        sendError(res, 404, "NOT_FOUND", "Product not found");
        return;
      }

      const result = db
        .prepare("DELETE FROM products WHERE id = ?")
        .run(req.params.id);

      console.log("DELETE RESULT:", result);

      sendJson(res, 200, {
        data: {
          id: req.params.id,
          deleted: true,
        },
      });
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);

      sendError(res, 500, "DELETE_FAILED", err.message);
    }
  });

  router.add("GET", "/v1/service-areas", (req, res) => {
    const areas = db
      .prepare(`
        SELECT
          id,
          supplier_id AS supplierId,
          name
        FROM service_areas
        ORDER BY name
      `)
      .all();

    sendJson(res, 200, { data: areas });
  });

  router.add("POST", "/v1/service-areas", async (req, res) => {
    try {
      const body = await parseBody(req);

      const name = String(body.name || "").trim();

      if (!name) {
        sendError(
          res,
          400,
          "VALIDATION",
          "Service area name is required"
        );
        return;
      }

      const existing = db
        .prepare(
          "SELECT id FROM service_areas WHERE supplier_id = ? AND name = ?"
        )
        .get("sup-murugan", name);

      if (existing) {
        sendError(
          res,
          409,
          "DUPLICATE_AREA",
          "Service area already exists"
        );
        return;
      }

      const result = db
        .prepare(`
          INSERT INTO service_areas
          (supplier_id, name)
          VALUES (?, ?)
        `)
        .run("sup-murugan", name);

      const area = db
        .prepare(`
          SELECT
            id,
            supplier_id AS supplierId,
            name
          FROM service_areas
          WHERE id = ?
        `)
        .get(result.lastInsertRowid);

      sendJson(res, 201, { data: area });
    } catch (err) {
      sendError(
        res,
        400,
        "VALIDATION",
        err.message
      );
    }
  });

  router.add("GET", "/v1/bootstrap", (req, res) => {
    const customerId = req.query.customerId;

    const customer =
      store.customers.find((item) => item.id === customerId) ||
      store.customers[0];

    if (!customer) {
      sendError(
        res,
        404,
        "CUSTOMER_NOT_FOUND",
        "No customers available"
      );
      return;
    }

    const address =
      store.addresses.find(
        (item) => item.householdId === customer.householdId
      ) || null;

    const orders = store.orders
      .filter((item) => item.customerId === customer.id)
      .slice()
      .reverse();

    const orderIds = new Set(
      orders.map((item) => item.id)
    );

    const events = store.orderEvents.filter((item) =>
      orderIds.has(item.orderId)
    );

    sendJson(res, 200, {
      data: {
        customer,
        address,
        suppliers: store.suppliers,
        products: store.products,
        orders,
        events,
        customers: store.customers,
      },
    });
  });
}

module.exports = { registerCatalogRoutes };