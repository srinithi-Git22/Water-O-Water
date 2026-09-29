const { ORDER_STATUS } = require("../../../../packages/contracts/enums/order-status");
const { ORDER_SOURCE } = require("../../../../packages/contracts/enums/order-source");
const { SERVICE_TYPE } = require("../../../../packages/contracts/enums/service-type");
const { PAY_MODE } = require("../../../../packages/contracts/enums/pay-mode");
const { MONEY_TYPE } = require("../../../../packages/contracts/enums/money-type");

function seedDemoData(store) {
  store.suppliers.push(
    {
      id: "sup-murugan",
      name: "Murugan Water",
      phone: "+919876540001",
      status: "verified",
      plan: "network",
      reliabilityScore: 96.4,
    },
    {
      id: "sup-balaji",
      name: "Sri Balaji Water",
      phone: "+919876540002",
      status: "verified",
      plan: "network",
      reliabilityScore: 91.2,
    }
  );

  store.users.push(
    { id: "user-owner", name: "Murugan", phone: "+919876540001", role: "owner" },
    { id: "user-rider", name: "Murugan Rider", phone: "+919876540011", role: "rider" }
  );

  store.households.push({ id: "hh-ayesha" });

  store.customers.push({
    id: "cust-ayesha",
    householdId: "hh-ayesha",
    name: "Ayesha R.",
    phone: "+919812340001",
    locale: "ta",
  });

  store.addresses.push({
    id: "addr-annanagar",
    householdId: "hh-ayesha",
    line: "Anna Nagar, Chennai",
    deliveryPref: "door",
  });

  store.products.push({
    id: "prod-20l",
    supplierId: "sup-murugan",
    sku: "CAN20",
    nameEn: "20L Can",
    nameTa: "20லி கேன்",
    unitPricePaise: 4000,
    serviceType: SERVICE_TYPE.exchange,
  });

  store.orders.push({
    id: "ord-10432",
    code: "AR-10432",
    householdId: "hh-ayesha",
    customerId: "cust-ayesha",
    addressId: "addr-annanagar",
    primarySupplierId: "sup-murugan",
    fulfillingSupplierId: "sup-murugan",
    productId: "prod-20l",
    qty: 2,
    unitPricePaise: 4000,
    totalPaise: 8000,
    source: ORDER_SOURCE.whatsapp,
    status: ORDER_STATUS.outForDelivery,
    isFallback: false,
    customerConsentedFallback: false,
    version: 3,
    riderName: "Murugan",
    eta: "today by 6:30 PM",
    createdAt: new Date().toISOString(),
  });

  store.orderEvents.push({
    orderId: "ord-10432",
    fromStatus: ORDER_STATUS.accepted,
    toStatus: ORDER_STATUS.outForDelivery,
    actorType: "rider",
    reason: "start",
    at: new Date().toISOString(),
  });

  store.moneyEntries.push({
    id: 1,
    supplierId: "sup-murugan",
    householdId: "hh-ayesha",
    type: MONEY_TYPE.charge,
    amountPaise: 8000,
    sign: 1,
    mode: PAY_MODE.upi,
    orderId: "ord-10432",
  });
}

module.exports = { seedDemoData };
