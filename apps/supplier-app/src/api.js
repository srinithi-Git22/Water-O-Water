
const API_BASE_URL = "http://127.0.0.1:3001/v1";

export async function getOrders() {
  const response = await fetch(
    `${API_BASE_URL}/orders`
  );

  if (!response.ok) {
    throw new Error("Failed to load orders");
  }

  const result = await response.json();

  return result.data;
}

export async function getProducts() {
  const response = await fetch(
    `${API_BASE_URL}/products`
  );

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  const result = await response.json();

  return result.data;
}

export async function acceptOrder(
  orderId,
  expectedVersion
) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expectedVersion,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to accept order"
    );
  }

  return result.data;
}
export async function rejectOrder(
  orderId,
  expectedVersion
) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/decline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expectedVersion,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to reject order"
    );
  }

  return result.data;
}

export async function startDelivery(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to start delivery"
    );
  }

  return result.data;
}

/* ================= COMPLETE DELIVERY ================= */

export async function recordDelivery(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/deliveries`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        riderUserId: "user-rider",
        fullOut: 1,
        emptyIn: 0,
        paymentMode: "cash",
        amountCollectedPaise: 0,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to mark delivery as completed"
    );
  }

  return result.data;
}

/* ================= DELIVERY PARTNERS ================= */

export async function getDeliveryPartners(
  supplierId
) {
  const query = supplierId
    ? `?supplierId=${encodeURIComponent(
        supplierId
      )}`
    : "";

  const response = await fetch(
    `${API_BASE_URL}/delivery-partners${query}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to load delivery partners"
    );
  }

  return result.data;
}

export async function assignDeliveryPartner(
  orderId,
  deliveryPartnerId
) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/assign-delivery-partner`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deliveryPartnerId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to assign delivery partner"
    );
  }

  return result.data;
}

/* ================= PRODUCTS ================= */

export async function createProduct(product) {
  const response = await fetch(
    `${API_BASE_URL}/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to create product"
    );
  }

  return result.data;
}

export async function deleteProduct(productId) {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to delete product"
    );
  }

  return result.data;
}

/* ================= SERVICE AREAS ================= */

export async function getServiceAreas() {
  const response = await fetch(
    `${API_BASE_URL}/service-areas`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load service areas"
    );
  }

  const result = await response.json();

  return result.data;
}

export async function createServiceArea(name) {
  const response = await fetch(
    `${API_BASE_URL}/service-areas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to create service area"
    );
  }

  return result.data;
}

