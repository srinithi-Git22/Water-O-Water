const db = require("./database");
const { createStore } = require("../store/memory-store");
const { seedDemoData } = require("../seed/demo-data");

const store = createStore();

seedDemoData(store);

const insertSupplier = db.prepare(`
  INSERT OR REPLACE INTO suppliers
  (id, name, phone, status, plan, reliability_score)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertCustomer = db.prepare(`
  INSERT OR REPLACE INTO customers
  (id, household_id, name, phone, locale)
  VALUES (?, ?, ?, ?, ?)
`);

const insertAddress = db.prepare(`
  INSERT OR REPLACE INTO addresses
  (id, household_id, line, delivery_pref)
  VALUES (?, ?, ?, ?)
`);

const insertProduct = db.prepare(`
  INSERT OR REPLACE INTO products
  (id, supplier_id, sku, name_en, name_ta, unit_price_paise, service_type)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertOrder = db.prepare(`
  INSERT OR REPLACE INTO orders
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
    eta,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertOrderEvent = db.prepare(`
  INSERT INTO order_events
  (order_id, from_status, to_status, actor_type, reason, at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const migrate = db.transaction(() => {
  for (const supplier of store.suppliers) {
    insertSupplier.run(
      supplier.id,
      supplier.name,
      supplier.phone,
      supplier.status,
      supplier.plan,
      supplier.reliabilityScore
    );
  }

  for (const customer of store.customers) {
    insertCustomer.run(
      customer.id,
      customer.householdId,
      customer.name,
      customer.phone,
      customer.locale
    );
  }

  for (const address of store.addresses) {
    insertAddress.run(
      address.id,
      address.householdId,
      address.line,
      address.deliveryPref
    );
  }

  for (const product of store.products) {
    insertProduct.run(
      product.id,
      product.supplierId,
      product.sku,
      product.nameEn,
      product.nameTa,
      product.unitPricePaise,
      product.serviceType
    );
  }

  for (const order of store.orders) {
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
      order.isFallback ? 1 : 0,
      order.customerConsentedFallback ? 1 : 0,
      order.version,
      order.riderName,
      order.eta,
      order.createdAt
    );
  }

  for (const event of store.orderEvents) {
    insertOrderEvent.run(
      event.orderId,
      event.fromStatus,
      event.toStatus,
      event.actorType,
      event.reason,
      event.at
    );
  }
});

migrate();

console.log("Demo data migrated into SQLite.");