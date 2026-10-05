import { apiRequest } from "./client";

export async function requestOtp(phone) {
  return apiRequest("/auth/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
    }),
  });
}

export async function verifyOtp(
  phone,
  otp
) {
  return apiRequest("/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      otp,
    }),
  });
}

export async function registerCustomer(
  customerData
) {
  return apiRequest(
    "/auth/register-customer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        customerData
      ),
    }
  );
}