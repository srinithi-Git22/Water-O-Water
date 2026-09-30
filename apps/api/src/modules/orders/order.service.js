const {
  ERROR_CODES,
} = require("../../../../../packages/contracts/enums/error-codes");

const {
  ORDER_STATUS,
} = require("../../../../../packages/contracts/enums/order-status");

const {
  ORDER_SOURCE,
} = require("../../../../../packages/contracts/enums/order-source");

const {
  findTransition,
} = require("../../../../../packages/contracts/order-machine/can-transition");

const { newId } = require("../../store/ids");

const db = require("../../db/database");

function ApiError(code, message, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

function createOrderService(store) {
  function getById(id) {
    return store.orders.find(
      (order) => order.id === id
    );
  }

  function list() {
    return store.orders
      .slice()
      .sort((a, b) => {
        return String(
          b.createdAt
        ).localeCompare(
          String(a.createdAt)
        );
      });
  }

  function place(input) {
    /*
     * Support multiple products.
     *
     * New format:
     * items: [
     *   { productId: "...", qty: 2 },
     *   { productId: "...", qty: 1 }
     * ]
     *
     * Old format with productId + qty
     * is still supported.
     */

    let items = Array.isArray(input.items)
      ? input.items
      : [];

    if (items.length === 0 && input.productId) {
      items = [
        {
          productId: input.productId,
          qty: Number(input.qty || 1),
        },
      ];
    }

    if (items.length === 0) {
      throw ApiError(
        "VALIDATION",
        "At least one product is required",
        400
      );
    }

    const orderItems = [];

    for (const item of items) {
    const product = db
  .prepare(`
    SELECT
      id,
      unit_price_paise AS unitPricePaise
    FROM products
    WHERE id = ?
  `)
  .get(item.productId);
      if (!product) {
        throw ApiError(
          "PRODUCT_NOT_FOUND",
          "Product not found: " +
            item.productId,
          400
        );
      }

      const qty = Number(item.qty || 0);

      if (qty <= 0) {
        continue;
      }

      const unitPricePaise =
        Number(
          product.unitPricePaise || 0
        );

      orderItems.push({
        productId: product.id,
        qty,
        unitPricePaise,
        totalPaise:
          unitPricePaise * qty,
      });
    }

    if (orderItems.length === 0) {
      throw ApiError(
        "VALIDATION",
        "At least one product quantity must be greater than zero",
        400
      );
    }

    const firstItem = orderItems[0];

    const totalPaise =
      orderItems.reduce(
        (total, item) =>
          total + item.totalPaise,
        0
      );

    const order = {
      id: newId(),

      code:
        "AR-" +
        String(
          10000 +
            store.orders.length
        ),

      householdId:
        input.householdId,

      customerId:
        input.customerId,

      addressId:
        input.addressId,

      primarySupplierId:
        input.primarySupplierId,

      fulfillingSupplierId:
        input.primarySupplierId,

      /*
       * Keep these fields for compatibility
       * with the existing supplier/customer UI.
       * They represent the first item.
       */
      productId:
        firstItem.productId,

      qty:
        firstItem.qty,

      unitPricePaise:
        firstItem.unitPricePaise,

      totalPaise,

      items: orderItems,

      source:
        input.source ||
        ORDER_SOURCE.web,

      status:
        ORDER_STATUS.placed,

      isFallback: false,

      customerConsentedFallback:
        false,

      version: 1,

      riderName: null,

      eta:
        input.eta ||
        "today 4–7 pm",

      createdAt:
        new Date().toISOString(),
    };

    store.orders.push(order);

    /*
     * Save every product in the new
     * order_items table.
     */
    const insertItem = db.prepare(`
      INSERT INTO order_items
      (
        order_id,
        product_id,
        qty,
        unit_price_paise,
        total_paise
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const saveItems = db.transaction(
      (itemsToSave) => {
        for (const item of itemsToSave) {
          insertItem.run(
            order.id,
            item.productId,
            item.qty,
            item.unitPricePaise,
            item.totalPaise
          );
        }
      }
    );

    saveItems(orderItems);

    store.orderEvents.push({
      orderId: order.id,

      fromStatus: null,

      toStatus:
        order.status,

      actorType:
        input.actorType ||
        "customer",

      reason: "place",

      at:
        order.createdAt,
    });

    return order;
  }

  function transition(
    orderId,
    event,
    actorType,
    expectedVersion
  ) {
    const order =
      getById(orderId);

    if (!order) {
      throw ApiError(
        ERROR_CODES.NOT_FOUND,
        "Order not found",
        404
      );
    }

    if (
      expectedVersion != null &&
      Number(expectedVersion) !==
        order.version
    ) {
      throw ApiError(
        ERROR_CODES.ORDER_VERSION_CONFLICT,
        "Order changed, refresh",
        409
      );
    }

    if (
      event === "accept" &&
      order.status ===
        ORDER_STATUS.fallbackOffered
    ) {
      if (
        order.customerConsentedFallback
      ) {
        throw ApiError(
          ERROR_CODES.FALLBACK_LOCKED,
          "Primary locked after customer said yes",
          409
        );
      }

      event =
        "primary_accept";
    }

    const row =
      findTransition(
        order.status,
        event
      );

    if (!row) {
      throw ApiError(
        ERROR_CODES.ORDER_NOT_ACCEPTABLE,
        "This step is not allowed now",
        409
      );
    }

    const fromStatus =
      order.status;

    order.status = row.to;

    order.version += 1;

    store.orderEvents.push({
      orderId:
        order.id,

      fromStatus,

      toStatus:
        order.status,

      actorType,

      reason: event,

      at:
        new Date().toISOString(),
    });

    return order;
  }

  return {
    getById,
    list,
    place,
    transition,
  };
}

module.exports = {
  createOrderService,
};