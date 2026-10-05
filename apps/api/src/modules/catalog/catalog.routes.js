
const { sendJson, sendError } = require("../../http/send");
const { parseBody } = require("../../http/parse-body");

function registerCatalogRoutes(router, store, db) {
  router.add("GET", "/v1/health", (req, res) => {
    sendJson(res, 200, {
      data: {
        ok: true,
      },
    });
  });

  router.add("GET", "/v1/suppliers", (req, res) => {
    sendJson(res, 200, {
      data: store.suppliers,
    });
  });

  router.add("GET", "/v1/customers", (req, res) => {
    sendJson(res, 200, {
      data: store.customers,
    });
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

    sendJson(res, 200, {
      data: products,
    });
  });

  router.add("POST", "/v1/products", async (req, res) => {
    try {
      const body = await parseBody(req);

      const name = String(
        body.name || ""
      ).trim();

      const sku = String(
        body.sku || ""
      ).trim();

      const price = Number(body.price);

      if (!name) {
        sendError(
          res,
          400,
          "VALIDATION",
          "Product name is required"
        );
        return;
      }

      if (!sku) {
        sendError(
          res,
          400,
          "VALIDATION",
          "SKU is required"
        );
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        sendError(
          res,
          400,
          "VALIDATION",
          "Valid price is required"
        );
        return;
      }

      const existing = db
        .prepare(
          "SELECT id FROM products WHERE sku = ?"
        )
        .get(sku);

      if (existing) {
        sendError(
          res,
          409,
          "DUPLICATE_SKU",
          "SKU already exists"
        );
        return;
      }

      const id =
        "prod-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2, 8);

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

      sendJson(res, 201, {
        data: product,
      });
    } catch (err) {
      sendError(
        res,
        400,
        "VALIDATION",
        err.message
      );
    }
  });

  router.add("DELETE", "/v1/products/:id", (req, res) => {
    try {
      console.log(
        "DELETE PRODUCT:",
        req.params.id
      );

      const product = db
        .prepare(
          "SELECT id FROM products WHERE id = ?"
        )
        .get(req.params.id);

      console.log(
        "PRODUCT FOUND:",
        product
      );

      if (!product) {
        sendError(
          res,
          404,
          "NOT_FOUND",
          "Product not found"
        );
        return;
      }

      const result = db
        .prepare(
          "DELETE FROM products WHERE id = ?"
        )
        .run(req.params.id);

      console.log(
        "DELETE RESULT:",
        result
      );

      sendJson(res, 200, {
        data: {
          id: req.params.id,
          deleted: true,
        },
      });
    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      sendError(
        res,
        500,
        "DELETE_FAILED",
        err.message
      );
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

    sendJson(res, 200, {
      data: areas,
    });
  });

  router.add(
    "POST",
    "/v1/service-areas",
    async (req, res) => {
      try {
        const body = await parseBody(req);

        const name = String(
          body.name || ""
        ).trim();

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
          .get(
            "sup-murugan",
            name
          );

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
          .run(
            "sup-murugan",
            name
          );

        const area = db
          .prepare(`
            SELECT
              id,
              supplier_id AS supplierId,
              name
            FROM service_areas
            WHERE id = ?
          `)
          .get(
            result.lastInsertRowid
          );

        sendJson(res, 201, {
          data: area,
        });
      } catch (err) {
        sendError(
          res,
          400,
          "VALIDATION",
          err.message
        );
      }
    }
  );

  /*
   * BOOTSTRAP
   *
   * New customers are stored in SQLite.
   * Therefore we first look for the requested
   * customer in the SQLite customers table.
   *
   * This prevents new users from seeing the
   * demo Ayesha / Anna Nagar customer.
   */
  router.add(
    "GET",
    "/v1/bootstrap",
    (req, res) => {
      try {
        const customerId = String(
          req.query.customerId || ""
        ).trim();

        /*
         * If a customerId was supplied,
         * look for that customer in SQLite.
         */
        let customer = null;

        if (customerId) {
          customer = db
            .prepare(`
              SELECT
                id,
                household_id AS householdId,
                name,
                phone,
                locale
              FROM customers
              WHERE id = ?
              LIMIT 1
            `)
            .get(customerId);
        }

        /*
         * REAL CUSTOMER
         */
        if (customer) {
          const address = db
            .prepare(`
              SELECT
                id,
                household_id AS householdId,
                line,
                delivery_pref AS deliveryPref
              FROM addresses
              WHERE household_id = ?
              ORDER BY id
              LIMIT 1
            `)
            .get(
              customer.householdId
            ) || null;

          const orders = db
            .prepare(`
              SELECT
                id,
                code,
                household_id AS householdId,
                customer_id AS customerId,
                address_id AS addressId,
                primary_supplier_id AS primarySupplierId,
                fulfilling_supplier_id AS fulfillingSupplierId,
                product_id AS productId,
                qty,
                unit_price_paise AS unitPricePaise,
                total_paise AS totalPaise,
                source,
                status,
                is_fallback AS isFallback,
                customer_consented_fallback AS customerConsentedFallback,
                version,
                rider_name AS riderName,
                eta,
                created_at AS createdAt
              FROM orders
              WHERE customer_id = ?
              ORDER BY created_at DESC
            `)
            .all(customer.id);

          let events = [];

          if (orders.length > 0) {
            const orderIds = orders.map(
              (order) => order.id
            );

            const placeholders =
              orderIds
                .map(() => "?")
                .join(",");

            events = db
              .prepare(`
                SELECT
                  id,
                  order_id AS orderId,
                  from_status AS fromStatus,
                  to_status AS toStatus,
                  actor_type AS actorType,
                  reason,
                  at
                FROM order_events
                WHERE order_id IN (${placeholders})
                ORDER BY at ASC
              `)
              .all(...orderIds);
          }

          const suppliers = db
            .prepare(`
              SELECT
                id,
                name,
                phone,
                status,
                plan,
                reliability_score AS reliabilityScore
              FROM suppliers
              ORDER BY name
            `)
            .all();

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

          const customers = db
            .prepare(`
              SELECT
                id,
                household_id AS householdId,
                name,
                phone,
                locale
              FROM customers
              ORDER BY name
            `)
            .all();

          sendJson(res, 200, {
            data: {
              customer,
              address,
              suppliers,
              products,
              orders,
              events,
              customers,
            },
          });

          return;
        }

        /*
         * OLD DEMO CUSTOMER FALLBACK
         *
         * This keeps existing demo flows working
         * if no SQLite customer is found.
         */
        const demoCustomer =
          store.customers.find(
            (item) =>
              item.id === customerId
          ) ||
          store.customers[0];

        if (!demoCustomer) {
          sendError(
            res,
            404,
            "CUSTOMER_NOT_FOUND",
            "No customers available"
          );
          return;
        }

        const demoAddress =
          store.addresses.find(
            (item) =>
              item.householdId ===
              demoCustomer.householdId
          ) || null;

        const demoOrders =
          store.orders
            .filter(
              (item) =>
                item.customerId ===
                demoCustomer.id
            )
            .slice()
            .reverse();

        const demoOrderIds =
          new Set(
            demoOrders.map(
              (item) => item.id
            )
          );

        const demoEvents =
          store.orderEvents.filter(
            (item) =>
              demoOrderIds.has(
                item.orderId
              )
          );

        sendJson(res, 200, {
          data: {
            customer: demoCustomer,
            address: demoAddress,
            suppliers: store.suppliers,
            products: store.products,
            orders: demoOrders,
            events: demoEvents,
            customers: store.customers,
          },
        });
      } catch (error) {
        console.error(
          "Bootstrap error:",
          error
        );

        sendError(
          res,
          500,
          "BOOTSTRAP_ERROR",
          "Could not load customer data"
        );
      }
    }
  );
}

module.exports = {
  registerCatalogRoutes,
};

