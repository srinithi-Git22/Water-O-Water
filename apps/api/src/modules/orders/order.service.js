
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

function calculateInitialEta(createdAt, quantity) {
  const quantityNumber = Math.max(
    1,
    Number(quantity || 1)
  );

  const minutes = Math.min(
    180,
    60 + (quantityNumber - 1) * 15
  );

  const etaDate = new Date(createdAt);

  etaDate.setMinutes(
    etaDate.getMinutes() + minutes
  );

  return etaDate.toISOString();
}

function calculateAcceptedEta(now) {
  const etaDate = new Date(now);

  etaDate.setMinutes(
    etaDate.getMinutes() + 60
  );

  return etaDate.toISOString();
}

function calculateOutForDeliveryEta(now) {
  const etaDate = new Date(now);

  etaDate.setMinutes(
    etaDate.getMinutes() + 30
  );

  return etaDate.toISOString();
}

function createOrderService(store) {
  function mapDatabaseOrder(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      code: row.code,
      householdId: row.householdId,
      customerId: row.customerId,
      addressId: row.addressId,

      primarySupplierId:
        row.primarySupplierId,

      fulfillingSupplierId:
        row.fulfillingSupplierId,

      productId: row.productId,

      qty: row.qty,

      unitPricePaise:
        row.unitPricePaise,

      totalPaise:
        row.totalPaise,

      source: row.source,

      status: row.status,

      isFallback:
        Boolean(row.isFallback),

      customerConsentedFallback:
        Boolean(
          row.customerConsentedFallback
        ),

      version: row.version,

      riderName:
        row.riderName,

      riderPhone:
        row.riderPhone,

      vehicleNumber:
        row.vehicleNumber,

      eta:
        row.eta,

      createdAt:
        row.createdAt,
    };
  }

  function getDatabaseOrder(id) {
    const row = db
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
          rider_phone AS riderPhone,
          vehicle_number AS vehicleNumber,
          eta,
          created_at AS createdAt
        FROM orders
        WHERE id = ?
        LIMIT 1
      `)
      .get(id);

    return mapDatabaseOrder(row);
  }

  function getById(id) {
    const databaseOrder =
      getDatabaseOrder(id);

    if (databaseOrder) {
      const memoryIndex =
        store.orders.findIndex(
          (order) =>
            order.id === id
        );

      if (memoryIndex >= 0) {
        store.orders[memoryIndex] =
          databaseOrder;
      } else {
        store.orders.push(
          databaseOrder
        );
      }

      return databaseOrder;
    }

    return null;
  }

  function list(customerId) {
    let databaseOrders;

    if (customerId) {
      databaseOrders = db
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
            rider_phone AS riderPhone,
            vehicle_number AS vehicleNumber,
            eta,
            created_at AS createdAt
          FROM orders
          WHERE customer_id = ?
          ORDER BY created_at DESC
        `)
        .all(customerId)
        .map(mapDatabaseOrder);
    } else {
      databaseOrders = db
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
            rider_phone AS riderPhone,
            vehicle_number AS vehicleNumber,
            eta,
            created_at AS createdAt
          FROM orders
          ORDER BY created_at DESC
        `)
        .all()
        .map(mapDatabaseOrder);
    }

    store.orders.length = 0;

    for (const databaseOrder of databaseOrders) {
      store.orders.push(
        databaseOrder
      );
    }

    return databaseOrders;
  }

  function place(input) {
    input = input || {};

    let items = Array.isArray(
      input.items
    )
      ? input.items
      : [];

    if (
      items.length === 0 &&
      input.productId
    ) {
      items = [
        {
          productId:
            input.productId,
          qty: Number(
            input.qty || 1
          ),
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

    if (!input.customerId) {
      throw ApiError(
        "VALIDATION",
        "Customer is required",
        400
      );
    }

    if (!input.householdId) {
      throw ApiError(
        "VALIDATION",
        "Household is required",
        400
      );
    }

    if (!input.addressId) {
      throw ApiError(
        "VALIDATION",
        "Delivery address is required",
        400
      );
    }

    const customer = db
      .prepare(`
        SELECT
          id,
          household_id AS householdId
        FROM customers
        WHERE id = ?
        LIMIT 1
      `)
      .get(
        input.customerId
      );

    if (!customer) {
      throw ApiError(
        "CUSTOMER_NOT_FOUND",
        "Customer not found",
        400
      );
    }

    if (
      customer.householdId !==
      input.householdId
    ) {
      throw ApiError(
        "HOUSEHOLD_MISMATCH",
        "Customer does not belong to this household",
        400
      );
    }

    const address = db
      .prepare(`
        SELECT
          id,
          household_id AS householdId
        FROM addresses
        WHERE id = ?
        LIMIT 1
      `)
      .get(
        input.addressId
      );

    if (!address) {
      throw ApiError(
        "ADDRESS_NOT_FOUND",
        "Delivery address not found",
        400
      );
    }

    if (
      address.householdId !==
      input.householdId
    ) {
      throw ApiError(
        "ADDRESS_MISMATCH",
        "Delivery address does not belong to this household",
        400
      );
    }

    const orderItems = [];

    for (const item of items) {
      const product = db
        .prepare(`
          SELECT
            id,
            supplier_id AS supplierId,
            unit_price_paise AS unitPricePaise
          FROM products
          WHERE id = ?
          LIMIT 1
        `)
        .get(
          item.productId
        );

      if (!product) {
        throw ApiError(
          "PRODUCT_NOT_FOUND",
          "Product not found: " +
            item.productId,
          400
        );
      }

      const qty = Number(
        item.qty || 0
      );

      if (
        !Number.isInteger(qty) ||
        qty <= 0
      ) {
        continue;
      }

      const unitPricePaise =
        Number(
          product.unitPricePaise || 0
        );

      orderItems.push({
        productId:
          product.id,

        supplierId:
          product.supplierId,

        qty,

        unitPricePaise,

        totalPaise:
          unitPricePaise * qty,
      });
    }

    if (
      orderItems.length === 0
    ) {
      throw ApiError(
        "VALIDATION",
        "At least one product quantity must be greater than zero",
        400
      );
    }

    const supplierIds = [
      ...new Set(
        orderItems
          .map(
            (item) =>
              item.supplierId
          )
          .filter(Boolean)
      ),
    ];

    if (
      supplierIds.length === 0
    ) {
      throw ApiError(
        "SUPPLIER_NOT_FOUND",
        "Supplier information is not available",
        400
      );
    }

    if (
      supplierIds.length > 1
    ) {
      throw ApiError(
        "MULTIPLE_SUPPLIERS",
        "Products from multiple suppliers cannot be placed in one order",
        400
      );
    }

    const supplierId =
      supplierIds[0];

    const supplier = db
      .prepare(`
        SELECT id
        FROM suppliers
        WHERE id = ?
        LIMIT 1
      `)
      .get(
        supplierId
      );

    if (!supplier) {
      throw ApiError(
        "SUPPLIER_NOT_FOUND",
        "Supplier not found",
        400
      );
    }

    const firstItem =
      orderItems[0];

    const totalPaise =
      orderItems.reduce(
        (total, item) =>
          total +
          item.totalPaise,
        0
      );

    const createdAt =
      new Date().toISOString();

    const orderId =
      newId();

    const orderCode =
      "AR-" +
      String(Date.now());

    const estimatedDeliveryAt =
      calculateInitialEta(
        createdAt,
        firstItem.qty
      );

    const order = {
      id: orderId,

      code: orderCode,

      householdId:
        input.householdId,

      customerId:
        input.customerId,

      addressId:
        input.addressId,

      primarySupplierId:
        supplierId,

      fulfillingSupplierId:
        supplierId,

      productId:
        firstItem.productId,

      qty:
        firstItem.qty,

      unitPricePaise:
        firstItem.unitPricePaise,

      totalPaise,

      items:
        orderItems.map(
          ({
            productId,
            qty,
            unitPricePaise,
            totalPaise,
          }) => ({
            productId,
            qty,
            unitPricePaise,
            totalPaise,
          })
        ),

      source:
        input.source ||
        ORDER_SOURCE.web,

      status:
        ORDER_STATUS.placed,

      isFallback:
        false,

      customerConsentedFallback:
        false,

      version:
        1,

        
      riderName:
        null,

      riderPhone:
        null,

      vehicleNumber:
        null,

      eta:
        estimatedDeliveryAt,

      createdAt,
    };

    const insertOrder =
      db.prepare(`
        INSERT INTO orders
        (
          id,
          code,
          household_id,
          customer_id,
          address_id,
          primary_supplier_id,
          fulfilling_supplier_id,
          product_id,
          qty,
          unit_price_paise,
          total_paise,
          source,
          status,
          is_fallback,
          customer_consented_fallback,
          version,
          rider_name,
          rider_phone,
          vehicle_number,
          eta,
          created_at
        )
        VALUES
        (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

    const insertItem =
      db.prepare(`
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

    const insertEvent =
      db.prepare(`
        INSERT INTO order_events
        (
          order_id,
          from_status,
          to_status,
          actor_type,
          reason,
          at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

    const saveOrder =
      db.transaction(() => {
        insertOrder.run(
          order.id,
          order.code,
          order.householdId,
          order.customerId,
          order.addressId,
          order.primarySupplierId,
          order.fulfillingSupplierId,
          order.productId,
          order.qty,
          order.unitPricePaise,
          order.totalPaise,
          order.source,
          order.status,
          0,
          0,
          order.version,
          order.riderName,
          order.riderPhone,
          order.vehicleNumber,
          order.eta,
          order.createdAt
        );

        for (
          const item of orderItems
        ) {
          insertItem.run(
            order.id,
            item.productId,
            item.qty,
            item.unitPricePaise,
            item.totalPaise
          );
        }

        insertEvent.run(
          order.id,
          null,
          order.status,
          input.actorType ||
            "customer",
          "place",
          order.createdAt
        );
      });

    saveOrder();

    store.orders.push(
      order
    );

    store.orderEvents.push({
      orderId:
        order.id,

      fromStatus:
        null,

      toStatus:
        order.status,

      actorType:
        input.actorType ||
        "customer",

      reason:
        "place",

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

    const newStatus =
      row.to;

    const newVersion =
      order.version + 1;

    const eventAt =
      new Date().toISOString();

    let newEta =
      order.eta;

    if (
      newStatus ===
      ORDER_STATUS.accepted
    ) {
      newEta =
        calculateAcceptedEta(
          eventAt
        );
    }

    if (
      newStatus ===
      ORDER_STATUS.outForDelivery
    ) {
      newEta =
        calculateOutForDeliveryEta(
          eventAt
        );
    }

    if (
      newStatus ===
      ORDER_STATUS.delivered
    ) {
      newEta =
        eventAt;
    }

    db.transaction(() => {
      db.prepare(`
        UPDATE orders
        SET
          status = ?,
          version = ?,
          eta = ?
        WHERE id = ?
      `).run(
        newStatus,
        newVersion,
        newEta,
        order.id
      );

      db.prepare(`
        INSERT INTO order_events
        (
          order_id,
          from_status,
          to_status,
          actor_type,
          reason,
          at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        order.id,
        fromStatus,
        newStatus,
        actorType,
        event,
        eventAt
      );
    })();

    const updatedOrder =
      getDatabaseOrder(
        order.id
      );

    const memoryIndex =
      store.orders.findIndex(
        (item) =>
          item.id ===
          order.id
      );

    if (
      memoryIndex >= 0
    ) {
      store.orders[
        memoryIndex
      ] = updatedOrder;
    } else {
      store.orders.push(
        updatedOrder
      );
    }

    store.orderEvents.push({
      orderId:
        updatedOrder.id,

      fromStatus,

      toStatus:
        updatedOrder.status,

      actorType,

      reason:
        event,

      at:
        eventAt,
    });

    return updatedOrder;
  }

  function assignDeliveryPartner(
    orderId,
    deliveryPartnerId
  ) {
    const order = db
      .prepare(`
        SELECT
          id,
          fulfilling_supplier_id AS fulfillingSupplierId
        FROM orders
        WHERE id = ?
        LIMIT 1
      `)
      .get(orderId);

    if (!order) {
      throw ApiError(
        "ORDER_NOT_FOUND",
        "Order not found",
        404
      );
    }

    if (!deliveryPartnerId) {
      throw ApiError(
        "VALIDATION",
        "Delivery partner is required",
        400
      );
    }

    const partner = db
      .prepare(`
        SELECT
          id,
          supplier_id AS supplierId,
          name,
          phone,
          vehicle_number AS vehicleNumber,
          status
        FROM delivery_partners
        WHERE id = ?
        LIMIT 1
      `)
      .get(
        deliveryPartnerId
      );

    if (!partner) {
      throw ApiError(
        "DELIVERY_PARTNER_NOT_FOUND",
        "Delivery partner not found",
        404
      );
    }

    if (
      order.fulfillingSupplierId &&
      partner.supplierId !==
        order.fulfillingSupplierId
    ) {
      throw ApiError(
        "SUPPLIER_MISMATCH",
        "Delivery partner belongs to a different supplier",
        400
      );
    }

    db.prepare(`
      UPDATE orders
      SET
        rider_name = ?,
        rider_phone = ?,
        vehicle_number = ?
      WHERE id = ?
    `).run(
      partner.name,
      partner.phone,
      partner.vehicleNumber,
      orderId
    );

    const updatedOrder =
      getDatabaseOrder(
        orderId
      );

    const memoryIndex =
      store.orders.findIndex(
        (item) =>
          item.id === orderId
      );

    if (
      memoryIndex >= 0
    ) {
      store.orders[
        memoryIndex
      ] = updatedOrder;
    } else {
      store.orders.push(
        updatedOrder
      );
    }

    return updatedOrder;
  }

  return {
    getById,
    list,
    place,
    transition,
    assignDeliveryPartner,
  };
}

module.exports = {
  createOrderService,
};

