import { apiRequest } from "./client";

export async function getBootstrap(
  customerId
) {
  const endpoint = customerId
    ? `/bootstrap?customerId=${encodeURIComponent(
        customerId
      )}`
    : "/bootstrap";

  return apiRequest(endpoint);
}

export async function checkHealth() {
  return apiRequest("/health");
}

export async function getCustomerProfile(
  customerId
) {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  return apiRequest(
    `/customers/${encodeURIComponent(
      customerId
    )}`
  );
}

export async function updateCustomerProfile(
  customerId,
  data
) {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  return apiRequest(
    `/customers/${encodeURIComponent(
      customerId
    )}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    }
  );
}

export async function updateHomeAddress(
  customerId,
  data
) {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  return apiRequest(
    `/customers/${encodeURIComponent(
      customerId
    )}/address`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    }
  );
}