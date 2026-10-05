
const db = require("./database");

db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    status TEXT,
    plan TEXT,
    reliability_score REAL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    locale TEXT
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    line TEXT NOT NULL,
    delivery_pref TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ta TEXT,
    unit_price_paise INTEGER NOT NULL,
    service_type TEXT
  );

  CREATE TABLE IF NOT EXISTS delivery_partners (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    household_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    address_id TEXT,
    primary_supplier_id TEXT,
    fulfilling_supplier_id TEXT,
    product_id TEXT,
    qty INTEGER NOT NULL,
    unit_price_paise INTEGER NOT NULL,
    total_paise INTEGER NOT NULL,
    source TEXT,
    status TEXT NOT NULL,
    is_fallback INTEGER DEFAULT 0,
    customer_consented_fallback INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    rider_name TEXT,
    rider_phone TEXT,
    vehicle_number TEXT,
    eta TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    qty INTEGER NOT NULL,
    unit_price_paise INTEGER NOT NULL,
    total_paise INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    actor_type TEXT,
    reason TEXT,
    at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS service_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id TEXT NOT NULL,
    name TEXT NOT NULL
  );
`);

// Add new columns to an existing orders table
// without deleting or recreating existing orders.
function addColumnIfMissing(table, column, definition) {
  const columns = db
    .prepare(`PRAGMA table_info(${table})`)
    .all();

  const exists = columns.some(
    (item) => item.name === column
  );

  if (!exists) {
    db.exec(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
    );
  }
}

addColumnIfMissing(
  "orders",
  "rider_phone",
  "TEXT"
);

addColumnIfMissing(
  "orders",
  "vehicle_number",
  "TEXT"
);

console.log("Database schema ready.");

