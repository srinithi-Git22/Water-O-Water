const {
  parseBody,
} = require("../../http/parse-body");

const {
  sendJson,
  sendError,
} = require("../../http/send");

function registerCustomerRoutes(
  router,
  db
) {
  /*
   * GET CUSTOMER PROFILE
   *
   * Returns the real customer and
   * default address from SQLite.
   */
  router.add(
    "GET",
    "/v1/customers/:id",
    (req, res) => {
      try {
        const customerId =
          String(
            req.params.id || ""
          ).trim();

        if (!customerId) {
          sendError(
            res,
            400,
            "VALIDATION",
            "Customer ID is required"
          );

          return;
        }

        const customer =
          db
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

        if (!customer) {
          sendError(
            res,
            404,
            "CUSTOMER_NOT_FOUND",
            "Customer not found"
          );

          return;
        }

        const address =
          db
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

        sendJson(res, 200, {
          data: {
            customer,
            address,
          },
        });
      } catch (err) {
        console.error(
          "GET CUSTOMER ERROR:",
          err
        );

        sendError(
          res,
          500,
          "CUSTOMER_PROFILE_ERROR",
          "Could not load customer profile"
        );
      }
    }
  );

  /*
   * UPDATE CUSTOMER PROFILE
   *
   * Allows updating:
   * - name
   * - locale
   */
  router.add(
    "PUT",
    "/v1/customers/:id",
    async (req, res) => {
      try {
        const customerId =
          String(
            req.params.id || ""
          ).trim();

        if (!customerId) {
          sendError(
            res,
            400,
            "VALIDATION",
            "Customer ID is required"
          );

          return;
        }

        const body =
          await parseBody(req);

        const existing =
          db
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

        if (!existing) {
          sendError(
            res,
            404,
            "CUSTOMER_NOT_FOUND",
            "Customer not found"
          );

          return;
        }

        const name =
          body.name !== undefined
            ? String(
                body.name || ""
              ).trim()
            : existing.name;

        const locale =
          body.locale !== undefined
            ? String(
                body.locale || ""
              ).trim()
            : existing.locale;

        if (!name) {
          sendError(
            res,
            400,
            "VALIDATION",
            "Customer name is required"
          );

          return;
        }

        db.prepare(`
          UPDATE customers
          SET
            name = ?,
            locale = ?
          WHERE id = ?
        `).run(
          name,
          locale || null,
          customerId
        );

        const customer =
          db
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

        sendJson(res, 200, {
          data: customer,
        });
      } catch (err) {
        console.error(
          "UPDATE CUSTOMER ERROR:",
          err
        );

        sendError(
          res,
          400,
          "CUSTOMER_UPDATE_ERROR",
          err.message
        );
      }
    }
  );

  /*
   * UPDATE HOME ADDRESS
   *
   * Updates the customer's existing
   * default address in SQLite.
   */
  router.add(
    "PUT",
    "/v1/customers/:id/address",
    async (req, res) => {
      try {
        const customerId =
          String(
            req.params.id || ""
          ).trim();

        if (!customerId) {
          sendError(
            res,
            400,
            "VALIDATION",
            "Customer ID is required"
          );

          return;
        }

        const body =
          await parseBody(req);

        const customer =
          db
            .prepare(`
              SELECT
                id,
                household_id AS householdId
              FROM customers
              WHERE id = ?
              LIMIT 1
            `)
            .get(customerId);

        if (!customer) {
          sendError(
            res,
            404,
            "CUSTOMER_NOT_FOUND",
            "Customer not found"
          );

          return;
        }

        const address =
          db
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
            );

        if (!address) {
          sendError(
            res,
            404,
            "ADDRESS_NOT_FOUND",
            "Home address not found"
          );

          return;
        }

        const line =
          body.line !== undefined
            ? String(
                body.line || ""
              ).trim()
            : address.line;

        const deliveryPref =
          body.deliveryPref !== undefined
            ? String(
                body.deliveryPref || ""
              ).trim()
            : address.deliveryPref;

        if (!line) {
          sendError(
            res,
            400,
            "VALIDATION",
            "Home address is required"
          );

          return;
        }

        db.prepare(`
          UPDATE addresses
          SET
            line = ?,
            delivery_pref = ?
          WHERE id = ?
        `).run(
          line,
          deliveryPref || null,
          address.id
        );

        const updatedAddress =
          db
            .prepare(`
              SELECT
                id,
                household_id AS householdId,
                line,
                delivery_pref AS deliveryPref
              FROM addresses
              WHERE id = ?
              LIMIT 1
            `)
            .get(address.id);

        sendJson(res, 200, {
          data: updatedAddress,
        });
      } catch (err) {
        console.error(
          "UPDATE ADDRESS ERROR:",
          err
        );

        sendError(
          res,
          400,
          "ADDRESS_UPDATE_ERROR",
          err.message
        );
      }
    }
  );
}

module.exports = {
  registerCustomerRoutes,
};