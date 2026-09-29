const { ERROR_CODES } = require("../../../../../packages/contracts/enums/error-codes");
const { ORDER_STATUS } = require("../../../../../packages/contracts/enums/order-status");
const { ORDER_SOURCE } = require("../../../../../packages/contracts/enums/order-source");
const { findTransition } = require("../../../../../packages/contracts/order-machine/can-transition");
const { newId } = require("../../store/ids");

function ApiError(code, message, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

function createOrderService(store) {
  function getById(id) {
    return store.orders.find((order) => order.id === id);
  }

  function list() {
    return store.orders.slice().sort((a, b) => {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
  }

  function place(input) {
    const product = store.products.find((row) => row.id === input.productId);
    const qty = Number(input.qty || 1);
    const unitPricePaise = product ? product.unitPricePaise : 4000;
    const order = {
      id: newId(),
      code: "AR-" + String(10000 + store.orders.length),
      householdId: input.householdId,
      customerId: input.customerId,
      addressId: input.addressId,
      primarySupplierId: input.primarySupplierId,
      fulfillingSupplierId: input.primarySupplierId,
      productId: input.productId,
      qty,
      unitPricePaise,
      totalPaise: unitPricePaise * qty,
      source: input.source || ORDER_SOURCE.web,
      status: ORDER_STATUS.placed,
      isFallback: false,
      customerConsentedFallback: false,
      version: 1,
      riderName: null,
      eta: input.eta || "today 4–7 pm",
      createdAt: new Date().toISOString(),
    };
    store.orders.push(order);
    store.orderEvents.push({
      orderId: order.id,
      fromStatus: null,
      toStatus: order.status,
      actorType: input.actorType || "customer",
      reason: "place",
      at: order.createdAt,
    });
    return order;
  }

  function transition(orderId, event, actorType, expectedVersion) {
    const order = getById(orderId);
    if (!order) {
      throw ApiError(ERROR_CODES.NOT_FOUND, "Order not found", 404);
    }
    if (expectedVersion != null && Number(expectedVersion) !== order.version) {
      throw ApiError(ERROR_CODES.ORDER_VERSION_CONFLICT, "Order changed, refresh", 409);
    }
    if (event === "accept" && order.status === ORDER_STATUS.fallbackOffered) {
      if (order.customerConsentedFallback) {
        throw ApiError(ERROR_CODES.FALLBACK_LOCKED, "Primary locked after customer said yes", 409);
      }
      event = "primary_accept";
    }
    const row = findTransition(order.status, event);
    if (!row) {
      throw ApiError(ERROR_CODES.ORDER_NOT_ACCEPTABLE, "This step is not allowed now", 409);
    }
    const fromStatus = order.status;
    order.status = row.to;
    order.version += 1;
    store.orderEvents.push({
      orderId: order.id,
      fromStatus,
      toStatus: order.status,
      actorType,
      reason: event,
      at: new Date().toISOString(),
    });
    return order;
  }

  return { getById, list, place, transition };
}

module.exports = { createOrderService };
