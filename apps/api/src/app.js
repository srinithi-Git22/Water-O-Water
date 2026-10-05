const { createRouter } = require("./http/router");

const db = require("./db/database");

require("./db/schema");

const { sendError } = require("./http/send");

const { createStore } = require("./store/memory-store");

const { seedDemoData } = require("./seed/demo-data");

const { createOrderService } = require("./modules/orders/order.service");

const { createLedgerService } = require("./modules/ledger/ledger.service");

const {
  createDeliveryService,
} = require("./modules/deliveries/delivery.service");

const {
  createDeliveryPartnerService,
} = require("./modules/delivery-partners/delivery-partner.service");

const {
  createFallbackService,
} = require("./modules/dispatch/fallback.service");

const {
  createConversationService,
} = require("./modules/whatsapp/conversation.service");

const {
  registerCatalogRoutes,
} = require("./modules/catalog/catalog.routes");

const {
  registerCustomerRoutes,
} = require("./modules/customers/customer.routes");

const {
  registerAuthRoutes,
} = require("./modules/identity/auth.routes");

const {
  registerOrderRoutes,
} = require("./modules/orders/order.routes");

const {
  registerLedgerRoutes,
} = require("./modules/ledger/ledger.routes");

const {
  registerDeliveryRoutes,
} = require("./modules/deliveries/delivery.routes");

const {
  registerDeliveryPartnerRoutes,
} = require("./modules/delivery-partners/delivery-partner.routes");

const {
  registerFallbackRoutes,
} = require("./modules/dispatch/fallback.routes");

const {
  registerWhatsappRoutes,
} = require("./modules/whatsapp/webhook.routes");

function createApp() {
  const store = createStore();

  seedDemoData(store);

  const orders =
    createOrderService(store);

  const ledger =
    createLedgerService(store);

  const deliveries =
    createDeliveryService(
      store,
      orders,
      ledger
    );

  const deliveryPartners =
    createDeliveryPartnerService();

  const fallback =
    createFallbackService(
      store,
      orders
    );

  const conversation =
    createConversationService(
      store,
      orders
    );

  const services = {
    store,
    orders,
    ledger,
    deliveries,
    deliveryPartners,
    fallback,
    conversation,
  };

  const router =
    createRouter();

  registerCatalogRoutes(
    router,
    store,
    db
  );

  registerCustomerRoutes(
    router,
    db
  );

  registerAuthRoutes(
    router,
    store
  );

  registerOrderRoutes(
    router,
    services
  );

  registerLedgerRoutes(
    router,
    services
  );

  registerDeliveryRoutes(
    router,
    services
  );

  registerDeliveryPartnerRoutes(
    router,
    services
  );

  registerFallbackRoutes(
    router,
    services
  );

  registerWhatsappRoutes(
    router,
    services
  );

  return {
    router,
    store,
    services,
  };
}

async function handleRequest(
  app,
  req,
  res
) {
  try {
    const matched =
      await app.router.handle(
        req,
        res
      );

    if (!matched) {
      sendError(
        res,
        404,
        "NOT_FOUND",
        "No API route for " +
          req.url
      );
    }
  } catch (err) {
    sendError(
      res,
      500,
      "VALIDATION",
      err.message
    );
  }
}

module.exports = {
  createApp,
  handleRequest,
};