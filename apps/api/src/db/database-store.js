const db = require("./database");

function createDatabaseStore() {
  return {
    suppliers: {
      list() {
        return db
          .prepare(`
            SELECT
              id,
              name,
              phone,
              status,
              plan,
              reliability_score AS reliabilityScore
            FROM suppliers
            ORDER BY name
          `)
          .all();
      },
    },

    customers: {
      list() {
        return db
          .prepare(`
            SELECT
              id,
              household_id AS householdId,
              name,
              phone,
              locale
            FROM customers
            ORDER BY name
          `)
          .all();
      },
    },

    addresses: {
      list() {
        return db
          .prepare(`
            SELECT
              id,
              household_id AS householdId,
              line,
              delivery_pref AS deliveryPref
            FROM addresses
            ORDER BY id
          `)
          .all();
      },
    },

    products: {
      list() {
        return db
          .prepare(`
            SELECT
              id,
              supplier_id AS supplierId,
              sku,
              name_en AS nameEn,
              name_ta AS nameTa,
              unit_price_paise AS unitPricePaise,
              service_type AS serviceType
            FROM products
            ORDER BY name_en
          `)
          .all();
      },
    },

    orders: {
      list() {
        return db
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
              eta,
              created_at AS createdAt
            FROM orders
            ORDER BY created_at DESC
          `)
          .all();
      },
    },
  };
}

module.exports = {
  createDatabaseStore,
};