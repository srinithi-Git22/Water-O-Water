const { parseBody } = require("../../http/parse-body");
const { sendJson, sendError } = require("../../http/send");
const { createDatabaseStore } = require("../../db/database-store");

const dbStore = createDatabaseStore();

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function registerAuthRoutes(router, store) {
  router.add("POST", "/v1/auth/otp", async (req, res) => {
    const body = await parseBody(req);

    if (!body.phone) {
      sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Phone number is required"
      );
      return;
    }

    sendJson(res, 200, {
      data: {
        sent: true,
        demoOtp: "123456",
      },
    });
  });

  router.add("POST", "/v1/auth/verify", async (req, res) => {
    const body = await parseBody(req);

    if (String(body.otp) !== "123456") {
      sendError(
        res,
        401,
        "UNAUTHORIZED",
        "Wrong OTP"
      );
      return;
    }

    const phone = String(body.phone || "").trim();

    if (!phone) {
      sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Phone number is required"
      );
      return;
    }

    const existingCustomer =
      dbStore.customers.findByPhone(phone);

    sendJson(res, 200, {
      data: {
        accessToken: "demo-access",
        refreshToken: "demo-refresh",
        customer: existingCustomer || null,
        isNewCustomer: !existingCustomer,
      },
    });
  });

  router.add(
    "POST",
    "/v1/auth/register-customer",
    async (req, res) => {
      try {
        const body = await parseBody(req);

        const name = String(
          body.name || ""
        ).trim();

        const phone = String(
          body.phone || ""
        ).trim();

        const house = String(
          body.house || ""
        ).trim();

        const street = String(
          body.street || ""
        ).trim();

        const city = String(
          body.city || ""
        ).trim();

        const pincode = String(
          body.pincode || ""
        ).trim();

        const landmark = String(
          body.landmark || ""
        ).trim();

        if (!name) {
          sendError(
            res,
            400,
            "VALIDATION_ERROR",
            "Name is required"
          );
          return;
        }

        if (!phone) {
          sendError(
            res,
            400,
            "VALIDATION_ERROR",
            "Phone number is required"
          );
          return;
        }

        if (!house || !street || !city || !pincode) {
          sendError(
            res,
            400,
            "VALIDATION_ERROR",
            "Complete delivery address is required"
          );
          return;
        }

        const existingCustomer =
          dbStore.customers.findByPhone(phone);

        if (existingCustomer) {
          sendJson(res, 200, {
            data: {
              customer: existingCustomer,
              existing: true,
            },
          });
          return;
        }

        const householdId =
          createId("hh");

        const customerId =
          createId("cust");

        const addressId =
          createId("addr");

        const addressLine = [
          house,
          street,
          city,
          pincode,
          landmark,
        ]
          .filter(Boolean)
          .join(", ");

        const customer =
          dbStore.customers.create({
            id: customerId,
            householdId,
            name,
            phone,
            locale: "en",
          });

        const address =
          dbStore.addresses.create({
            id: addressId,
            householdId,
            line: addressLine,
            deliveryPref: "standard",
          });

        sendJson(res, 201, {
          data: {
            customer,
            address,
            existing: false,
          },
        });
      } catch (error) {
        console.error(
          "Customer registration error:",
          error
        );

        sendError(
          res,
          500,
          "INTERNAL_ERROR",
          "Could not create customer"
        );
      }
    }
  );
}

module.exports = {
  registerAuthRoutes,
};