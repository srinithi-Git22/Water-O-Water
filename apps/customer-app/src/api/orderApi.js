
import { apiRequest } from "./client";

export async function createOrder(orderData) {
  return apiRequest("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
}

export async function getProducts() {
  return apiRequest("/products");
}

export async function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

/*
 * Get orders for the logged-in customer.
 *
 * The customerId is sent to the backend so the API
 * returns only that customer's orders.
 */
export async function getOrders(customerId) {
  if (!customerId) {
    return [];
  }

  return apiRequest(
    `/orders?customerId=${encodeURIComponent(
      customerId
    )}`
  );
}

