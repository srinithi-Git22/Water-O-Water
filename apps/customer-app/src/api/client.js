
const API_BASE_URL = "http://10.75.85.7:3001/v1";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    options
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json?.error?.message ||
        "API request failed"
    );
  }

  return json.data;
}

