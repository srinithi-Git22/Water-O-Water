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

      findByPhone(phone) {
        return db
          .prepare(`
            SELECT
              id,
              household_id AS householdId,
              name,
              phone,
              locale
            FROM customers
            WHERE phone = ?
            LIMIT 1
          `)
          .get(phone);
      },

      findById(id) {
        return db
          .prepare(`
            SELECT
              id,
              household_id AS householdId,
              name,
              phone,
              locale
            FROM customers
            WHERE id = ?
            LIMIT 1
          `)
          .get(id);
      },

      create(customer) {
        db.prepare(`
          INSERT INTO customers (
            id,
            household_id,
            name,
            phone,
            locale
          )
          VALUES (?, ?, ?, ?, ?)
        `).run(
          customer.id,
          customer.householdId,
          customer.name,
          customer.phone,
          customer.locale || "en"
        );

        return this.findById(customer.id);
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

      create(address) {
        db.prepare(`
          INSERT INTO addresses (
            id,
            household_id,
            line,
            delivery_pref
          )
          VALUES (?, ?, ?, ?)
        `).run(
          address.id,
          address.householdId,
          address.line,
          address.deliveryPref || "standard"
        );

        return db
          .prepare(`
            SELECT
              id,
              household_id AS householdId,
              line,
              delivery_pref AS deliveryPref
            FROM addresses
            WHERE id = ?
          `)
          .get(address.id);
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