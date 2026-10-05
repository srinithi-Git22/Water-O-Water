
const db = require("../../db/database");
const { newId } = require("../../store/ids");

function ApiError(code, message, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

function createDeliveryPartnerService() {
  function list(supplierId) {
    if (supplierId) {
      return db
        .prepare(`
          SELECT
            id,
            supplier_id AS supplierId,
            name,
            phone,
            vehicle_number AS vehicleNumber,
            status,
            created_at AS createdAt
          FROM delivery_partners
          WHERE supplier_id = ?
          ORDER BY name
        `)
        .all(supplierId);
    }

    return db
      .prepare(`
        SELECT
          id,
          supplier_id AS supplierId,
          name,
          phone,
          vehicle_number AS vehicleNumber,
          status,
          created_at AS createdAt
        FROM delivery_partners
        ORDER BY name
      `)
      .all();
  }

  function create(input) {
    input = input || {};

    const supplierId =
      String(input.supplierId || "").trim();

    const name =
      String(input.name || "").trim();

    const phone =
      String(input.phone || "").trim();

    const vehicleNumber =
      String(input.vehicleNumber || "").trim();

    if (!supplierId) {
      throw ApiError(
        "VALIDATION",
        "Supplier is required",
        400
      );
    }

    if (!name) {
      throw ApiError(
        "VALIDATION",
        "Delivery partner name is required",
        400
      );
    }

    if (!phone) {
      throw ApiError(
        "VALIDATION",
        "Delivery partner phone is required",
        400
      );
    }

    if (!vehicleNumber) {
      throw ApiError(
        "VALIDATION",
        "Vehicle number is required",
        400
      );
    }

    const supplier = db
      .prepare(`
        SELECT id
        FROM suppliers
        WHERE id = ?
        LIMIT 1
      `)
      .get(supplierId);

    if (!supplier) {
      throw ApiError(
        "SUPPLIER_NOT_FOUND",
        "Supplier not found",
        400
      );
    }

    const partner = {
      id: newId(),
      supplierId,
      name,
      phone,
      vehicleNumber,
      status: "available",
      createdAt: new Date().toISOString(),
    };

    db.prepare(`
      INSERT INTO delivery_partners
      (
        id,
        supplier_id,
        name,
        phone,
        vehicle_number,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      partner.id,
      partner.supplierId,
      partner.name,
      partner.phone,
      partner.vehicleNumber,
      partner.status,
      partner.createdAt
    );

    return partner;
  }

  return {
    list,
    create,
  };
}

module.exports = {
  createDeliveryPartnerService,
};
